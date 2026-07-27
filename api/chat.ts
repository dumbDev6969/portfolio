import { MAX_HISTORY_TURNS, callGeminiWithFallback, type ChatHistoryTurn } from '../src/server/chatHandler.ts';
import type { IncomingMessage, ServerResponse } from 'http';

type NodeRequest = IncomingMessage & { body?: unknown };

type ChatRequestBody = {
  message: string;
  history?: ChatHistoryTurn[];
};

type ChatErrorCode =
  | 'invalid_request'
  | 'invalid_payload'
  | 'payload_too_large'
  | 'forbidden_origin'
  | 'misconfigured_server'
  | 'rate_limit_exceeded'
  | 'rate_limit_unavailable'
  | 'missing_client_ip'
  | 'provider_quota_exceeded'
  | 'upstream_service_error';

type ChatResponseBody = {
  reply?: string;
  error?: string;
  code?: ChatErrorCode;
};

type ParsedBodyResult =
  | { ok: true; body: ChatRequestBody }
  | { ok: false; status: number; body: ChatResponseBody };

type GateResult = { ok: true } | { ok: false; status: number; body: ChatResponseBody };

type ErrorResult = { status: number; body: ChatResponseBody };

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_MESSAGE_CHARS = 1200;
const MAX_HISTORY_MESSAGE_CHARS = 1200;
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 3600;
const textEncoder = new TextEncoder();

// Safely read a single header value from a Node.js IncomingMessage.
function getHeader(req: NodeRequest, name: string): string | null {
  const value = req.headers[name.toLowerCase()];
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(res: ServerResponse, body: ChatResponseBody, status: number): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function isProductionRuntime() {
  return process.env.NODE_ENV === 'production';
}

function parseOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function hasAllowedOrigin(req: NodeRequest): GateResult {
  const isProduction = isProductionRuntime();
  const configuredOrigin = process.env.CHAT_ALLOWED_ORIGIN?.trim() || '';
  if (!configuredOrigin) {
    if (isProduction) {
      return {
        ok: false,
        status: 500,
        body: { error: 'Server misconfiguration: CHAT_ALLOWED_ORIGIN is missing.', code: 'misconfigured_server' },
      };
    }

    return { ok: true };
  }

  const allowedOrigin = parseOrigin(configuredOrigin);
  if (!allowedOrigin) {
    return {
      ok: false,
      status: 500,
      body: { error: 'Server misconfiguration: CHAT_ALLOWED_ORIGIN is invalid.', code: 'misconfigured_server' },
    };
  }

  const origin = getHeader(req, 'origin');
  const referer = getHeader(req, 'referer');
  const isNonProduction = !isProduction;

  if (isNonProduction && (isLocalOrigin(origin) || isLocalOrigin(referer))) {
    return { ok: true };
  }

  const requestOrigin = parseOrigin(origin) || parseOrigin(referer);
  if (requestOrigin === allowedOrigin) {
    return { ok: true };
  }

  return {
    ok: false,
    status: 403,
    body: { error: 'Forbidden origin.', code: 'forbidden_origin' },
  };
}

function isHistoryTurn(value: unknown): value is ChatHistoryTurn {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const turn = value as Record<string, unknown>;
  return (
    (turn.role === 'user' || turn.role === 'assistant') &&
    typeof turn.message === 'string' &&
    turn.message.trim().length > 0 &&
    turn.message.length <= MAX_HISTORY_MESSAGE_CHARS
  );
}

function parseRequestBody(value: unknown): ParsedBodyResult {
  if (!value || typeof value !== 'object') {
    return { ok: false, status: 400, body: { error: 'Invalid request body.', code: 'invalid_payload' } };
  }

  const body = value as Record<string, unknown>;
  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return {
      ok: false,
      status: 400,
      body: { error: 'Invalid request body. Expected a non-empty message.', code: 'invalid_request' },
    };
  }

  if (body.message.length > MAX_MESSAGE_CHARS) {
    return {
      ok: false,
      status: 413,
      body: { error: `Message exceeds max length of ${MAX_MESSAGE_CHARS} characters.`, code: 'payload_too_large' },
    };
  }

  const history = Array.isArray(body.history) ? body.history : [];
  if (body.history !== undefined) {
    if (!Array.isArray(body.history) || !history.every(isHistoryTurn)) {
      return {
        ok: false,
        status: 400,
        body: { error: 'Invalid request body. Expected valid history turns.', code: 'invalid_request' },
      };
    }
  }

  if (history.length > MAX_HISTORY_TURNS) {
    return {
      ok: false,
      status: 413,
      body: { error: `History exceeds max turns of ${MAX_HISTORY_TURNS}.`, code: 'payload_too_large' },
    };
  }

  const parsedBody: ChatRequestBody = {
    message: body.message.trim(),
    history,
  };

  if (textEncoder.encode(JSON.stringify(parsedBody)).length > MAX_REQUEST_BYTES) {
    return {
      ok: false,
      status: 413,
      body: { error: `Payload exceeds max size of ${MAX_REQUEST_BYTES} bytes.`, code: 'payload_too_large' },
    };
  }

  return { ok: true, body: parsedBody };
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

function getRateLimitSettings() {
  return {
    maxRequests: parsePositiveInteger(process.env.CHAT_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX),
    windowSeconds: parsePositiveInteger(process.env.CHAT_RATE_LIMIT_WINDOW_SECONDS, DEFAULT_RATE_LIMIT_WINDOW_SECONDS),
  };
}

function getClientIp(req: NodeRequest): string | null {
  const forwardedFor = getHeader(req, 'x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor
      .split(',')
      .map((entry) => entry.trim())
      .find((entry) => entry.length > 0);
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = getHeader(req, 'x-real-ip');
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return null;
}

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  return {
    url: url.trim(),
    token: token.trim(),
  };
}

async function callKv(url: string, token: string, command: string) {
  const response = await fetch(`${url}${command}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`KV request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: unknown };
  return payload.result;
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

async function enforceRateLimit(req: NodeRequest): Promise<ErrorResult | null> {
  const isProduction = isProductionRuntime();
  const clientIp = getClientIp(req);
  if (!clientIp) {
    if (isProduction) {
      return { status: 400, body: { error: 'Unable to determine client IP.', code: 'missing_client_ip' } };
    }
    return null;
  }

  const kv = getKvConfig();
  if (!kv.url || !kv.token) {
    if (isProduction) {
      console.warn('[chat] Vercel KV is not configured — rate limiting is disabled.');
    }
    return null;
  }

  const settings = getRateLimitSettings();
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const windowStart = nowInSeconds - (nowInSeconds % settings.windowSeconds);
  const key = encodeURIComponent(`chat:rate:${clientIp}:${windowStart}`);

  try {
    const counterResult = await callKv(kv.url, kv.token, `/incr/${key}`);
    const hitCount = asNumber(counterResult);
    if (hitCount === null) {
      return { status: 500, body: { error: 'Rate limiter failed to parse counter state.', code: 'rate_limit_unavailable' } };
    }

    if (hitCount === 1) {
      await callKv(kv.url, kv.token, `/expire/${key}/${settings.windowSeconds}`);
    }

    if (hitCount > settings.maxRequests) {
      return {
        status: 429,
        body: {
          error: `Too many requests. Limit is ${settings.maxRequests} per ${settings.windowSeconds} seconds.`,
          code: 'rate_limit_exceeded',
        },
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rate limiter request failed.';
    return { status: 500, body: { error: message, code: 'rate_limit_unavailable' } };
  }

  return null;
}

export default async function handler(req: NodeRequest, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, { error: 'Method not allowed.' }, 405);
    return;
  }

  const originCheck = hasAllowedOrigin(req);
  if (!originCheck.ok) {
    sendJson(res, originCheck.body, originCheck.status);
    return;
  }

  const declaredSize = getHeader(req, 'content-length');
  if (declaredSize) {
    const parsedSize = Number(declaredSize);
    if (Number.isFinite(parsedSize) && parsedSize > MAX_REQUEST_BYTES) {
      sendJson(res, { error: `Payload exceeds max size of ${MAX_REQUEST_BYTES} bytes.`, code: 'payload_too_large' }, 413);
      return;
    }
  }

  // Vercel's Node.js runtime auto-parses JSON request bodies onto req.body
  const rawBody = req.body;
  if (rawBody === undefined || rawBody === null) {
    sendJson(res, { error: 'Invalid JSON payload.', code: 'invalid_payload' }, 400);
    return;
  }

  const parsedBody = parseRequestBody(rawBody);
  if (!parsedBody.ok) {
    sendJson(res, parsedBody.body, parsedBody.status);
    return;
  }

  const rateLimitResult = await enforceRateLimit(req);
  if (rateLimitResult !== null) {
    sendJson(res, rateLimitResult.body, rateLimitResult.status);
    return;
  }

  const result = await callGeminiWithFallback(
    parsedBody.body.message,
    parsedBody.body.history ?? [],
    process.env.GEMINI_API_KEY || '',
    process.env.GEMINI_MODEL,
    process.env.GEMINI_MODEL_FALLBACK
  );

  sendJson(res, result.body, result.status);
}
