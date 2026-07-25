import { callGeminiWithFallback, type ChatHistoryTurn } from '../src/server/chatHandler.ts';

type ChatRequestBody = {
  message: string;
  history?: ChatHistoryTurn[];
};

function jsonResponse(body: { reply?: string; error?: string }, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isLocalOriginUrl(value: string | null) {
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

function hasAllowedOrigin(req: Request) {
  const allowedOrigin = process.env.CHAT_ALLOWED_ORIGIN;
  if (!allowedOrigin) {
    return true;
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  const isNonProduction = process.env.NODE_ENV !== 'production';
  if (isNonProduction && (isLocalOriginUrl(origin) || isLocalOriginUrl(referer))) {
    return true;
  }

  if (origin === allowedOrigin) {
    return true;
  }

  return typeof referer === 'string' && referer.startsWith(allowedOrigin);
}

function isHistoryTurn(value: unknown): value is ChatHistoryTurn {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const turn = value as Record<string, unknown>;
  return (
    (turn.role === 'user' || turn.role === 'assistant') &&
    typeof turn.message === 'string' &&
    turn.message.trim().length > 0
  );
}

function parseRequestBody(value: unknown): ChatRequestBody | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const body = value as Record<string, unknown>;
  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return null;
  }

  if (body.history !== undefined) {
    if (!Array.isArray(body.history) || !body.history.every(isHistoryTurn)) {
      return null;
    }
  }

  return {
    message: body.message.trim(),
    history: Array.isArray(body.history) ? body.history : [],
  };
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  if (!hasAllowedOrigin(req)) {
    return jsonResponse({ error: 'Forbidden origin.' }, 403);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const parsedBody = parseRequestBody(rawBody);
  if (!parsedBody) {
    return jsonResponse({ error: 'Invalid request body. Expected message and optional valid history.' }, 400);
  }

  const result = await callGeminiWithFallback(
    parsedBody.message,
    parsedBody.history ?? [],
    process.env.GEMINI_API_KEY || '',
    process.env.GEMINI_MODEL,
    process.env.GEMINI_MODEL_FALLBACK
  );

  return jsonResponse(result.body, result.status);
}
