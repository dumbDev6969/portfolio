import { MAX_HISTORY_TURNS, callGeminiWithFallback, type ChatHistoryTurn } from '../src/server/chatHandler.ts';

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

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_MESSAGE_CHARS = 1200;
const MAX_HISTORY_MESSAGE_CHARS = 1200;
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 3600;
const textEncoder = new TextEncoder();

function jsonResponse(body: ChatResponseBody, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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

function hasAllowedOrigin(req: Request): GateResult {
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

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
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

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor
      .split(',')
      .map((entry) => entry.trim())
      .find((entry) => entry.length > 0);
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = req.headers.get('x-real-ip');
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

async function enforceRateLimit(req: Request): Promise<Response | null> {
  const isProduction = isProductionRuntime();
  const clientIp = getClientIp(req);
  if (!clientIp) {
    if (isProduction) {
      return jsonResponse({ error: 'Unable to determine client IP.', code: 'missing_client_ip' }, 400);
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
      return jsonResponse({ error: 'Rate limiter failed to parse counter state.', code: 'rate_limit_unavailable' }, 500);
    }

    if (hitCount === 1) {
      await callKv(kv.url, kv.token, `/expire/${key}/${settings.windowSeconds}`);
    }

    if (hitCount > settings.maxRequests) {
      return jsonResponse(
        {
          error: `Too many requests. Limit is ${settings.maxRequests} per ${settings.windowSeconds} seconds.`,
          code: 'rate_limit_exceeded',
        },
        429
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rate limiter request failed.';
    return jsonResponse({ error: message, code: 'rate_limit_unavailable' }, 500);
  }

  return null;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const originCheck = hasAllowedOrigin(req);
  if (!originCheck.ok) {
    return jsonResponse(originCheck.body, originCheck.status);
  }

  const declaredSize = req.headers.get('content-length');
  if (declaredSize) {
    const parsedSize = Number(declaredSize);
    if (Number.isFinite(parsedSize) && parsedSize > MAX_REQUEST_BYTES) {
      return jsonResponse(
        { error: `Payload exceeds max size of ${MAX_REQUEST_BYTES} bytes.`, code: 'payload_too_large' },
        413
      );
    }
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.', code: 'invalid_payload' }, 400);
  }

  const parsedBody = parseRequestBody(rawBody);
  if (!parsedBody.ok) {
    return jsonResponse(parsedBody.body, parsedBody.status);
  }

  const rateLimitResponse = await enforceRateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const result = await callGeminiWithFallback(
    parsedBody.body.message,
    parsedBody.body.history ?? [],
    process.env.GEMINI_API_KEY || '',
    process.env.GEMINI_MODEL,
    process.env.GEMINI_MODEL_FALLBACK
  );

  return jsonResponse(result.body, result.status);
}
