import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

type ChatRequestBody = {
  message: string;
  history?: { role: 'user' | 'assistant'; message: string }[];
};

async function readRequestBody(req: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function isHistoryTurn(value: unknown): value is { role: 'user' | 'assistant'; message: string } {
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  const geminiModel = env.GEMINI_MODEL || process.env.GEMINI_MODEL;
  const geminiFallbackModel = env.GEMINI_MODEL_FALLBACK || process.env.GEMINI_MODEL_FALLBACK;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-chat-api-route',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const bodyText = await readRequestBody(req);
              let rawBody: unknown = null;
              try {
                rawBody = JSON.parse(bodyText);
              } catch {
                rawBody = null;
              }

              if (!rawBody) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid JSON payload.' }));
                return;
              }

              const parsedBody = parseRequestBody(rawBody);
              if (!parsedBody) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid request body. Expected message and optional valid history.' }));
                return;
              }

              const { callGeminiWithFallback } = await import('./src/server/chatHandler.ts');
              const result = await callGeminiWithFallback(
                parsedBody.message,
                parsedBody.history ?? [],
                geminiApiKey,
                geminiModel,
                geminiFallbackModel
              );

              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.body));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              const errorMessage = error instanceof Error ? error.message : 'Unknown API middleware error.';
              res.end(JSON.stringify({ error: errorMessage }));
            }
          });
        },
      },
    ],
  };
});
