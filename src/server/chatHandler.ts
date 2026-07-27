import projectsData from '../data/projects.json' with { type: 'json' };
import certificatesData from '../data/certificates.json' with { type: 'json' };
import contactData from '../data/contact.json' with { type: 'json' };

export type ChatHistoryTurn = {
  role: 'user' | 'assistant';
  message: string;
};

type ChatErrorCode =
  | 'invalid_request'
  | 'misconfigured_server'
  | 'provider_quota_exceeded'
  | 'upstream_service_error';

type ChatHandlerResponseBody = {
  reply?: string;
  error?: string;
  code?: ChatErrorCode;
};

type ChatHandlerResult = {
  status: number;
  body: ChatHandlerResponseBody;
};

type ProjectRecord = {
  title: string;
  description: string;
  technologies: string[];
};

type CertificateRecord = {
  title: string;
  issuer: string;
  earned: string;
};

type ContactRecord = {
  [key: string]: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

export const MAX_HISTORY_TURNS = 6;
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const STATIC_BIO_CONTEXT = [
  "You are answering questions on Joshua Cabuang's portfolio site, as his assistant.",
  'Background: Self-taught full-stack developer, fresh graduate, Philippines-based.',
  'Core stack: TALL stack (Tailwind, Alpine.js, Laravel, Livewire) and React/TypeScript.',
  'He graduated Cum Laude with a BSIT from Binalatongan Community College and received the "Best Programmer of the Year" award in 2026.',
  'Currently seeking a developer role.',
  "Answer only questions about Joshua's skills, projects, and background.",
  "Be concise, friendly, and professional — you're representing him to recruiters.",
  'If asked something unrelated to Joshua or his work, politely redirect.',
].join('\n');

function isProjectRecord(value: unknown): value is ProjectRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    Array.isArray(item.technologies) &&
    item.technologies.every((tech) => typeof tech === 'string')
  );
}

function isCertificateRecord(value: unknown): value is CertificateRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;
  return typeof item.title === 'string' && typeof item.issuer === 'string' && typeof item.earned === 'string';
}

function isContactRecord(value: unknown): value is ContactRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((field) => typeof field === 'string');
}

function normalizeModelName(modelValue: string | undefined) {
  const raw = modelValue?.trim();
  if (!raw) {
    return '';
  }

  return raw.startsWith('models/') ? raw.slice('models/'.length) : raw;
}

function getModelCandidates(primaryModel?: string, fallbackModel?: string) {
  const normalizedPrimary = normalizeModelName(primaryModel);
  const normalizedFallback = normalizeModelName(fallbackModel);
  const lastResort = DEFAULT_MODEL;

  const ordered = [normalizedPrimary, normalizedFallback, lastResort].filter((value) => value.length > 0);
  return [...new Set(ordered)];
}

function extractGeminiReply(data: GeminiResponse) {
  const firstCandidate = data.candidates?.[0];
  const parts = firstCandidate?.content?.parts;
  if (!Array.isArray(parts)) {
    return null;
  }

  const textPart = parts.find((part) => typeof part.text === 'string' && part.text.trim().length > 0);
  return textPart?.text?.trim() ?? null;
}

async function parseGeminiResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as GeminiResponse;
  } catch {
    return null;
  }
}

export function buildSystemContext() {
  const validProjects = projectsData.filter(isProjectRecord);
  const validCertificates = certificatesData.filter(isCertificateRecord);
  const validContact: ContactRecord = isContactRecord(contactData) ? contactData : {};

  const projectSummaries = validProjects
    .map((project) => `- ${project.title}: ${project.description} (Tech: ${project.technologies.join(', ')})`)
    .join('\n');

  const certSummaries = validCertificates
    .map((certificate) => `- ${certificate.title} (${certificate.issuer}, ${certificate.earned})`)
    .join('\n');

  const contactSummaries = Object.entries(validContact)
    .filter(([, value]) => value.trim().length > 0)
    .map(([field, value]) => `- ${field}: ${value}`)
    .join('\n');

  return `${STATIC_BIO_CONTEXT}

Projects:
${projectSummaries || '- No project records available.'}

Certifications:
${certSummaries || '- No certification records available.'}

Contact:
${contactSummaries || '- No contact records available.'}`;
}

export function mapHistoryToGemini(history: ChatHistoryTurn[]) {
  return history.slice(-MAX_HISTORY_TURNS).map((turn) => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.message }],
  }));
}

export async function callGeminiWithFallback(
  message: string,
  history: ChatHistoryTurn[],
  apiKey: string,
  primaryModel?: string,
  fallbackModel?: string
): Promise<ChatHandlerResult> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return {
      status: 400,
      body: { error: 'Message is required.', code: 'invalid_request' },
    };
  }

  if (!apiKey) {
    return {
      status: 500,
      body: { error: 'Server misconfiguration: GEMINI_API_KEY is missing.', code: 'misconfigured_server' },
    };
  }

  const systemContext = buildSystemContext();
  const contents = [...mapHistoryToGemini(history), { role: 'user', parts: [{ text: trimmedMessage }] }];
  const modelsToTry = getModelCandidates(primaryModel, fallbackModel);

  let lastStatus = 502;
  let lastError = 'Unable to reach Gemini service.';
  let lastCode: ChatErrorCode = 'upstream_service_error';

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemContext }] },
            contents,
          }),
        }
      );

      const data = await parseGeminiResponse(response);
      if (!response.ok) {
        if (response.status === 429) {
          lastStatus = 429;
          lastCode = 'provider_quota_exceeded';
          lastError = data?.error?.message || 'Gemini quota exhausted. Please try again later.';
          continue;
        }

        lastStatus = 502;
        lastCode = 'upstream_service_error';
        lastError = data?.error?.message || `Gemini request failed with status ${response.status} using model ${model}.`;
        continue;
      }

      if (!data) {
        lastStatus = 502;
        lastCode = 'upstream_service_error';
        lastError = `Gemini returned an empty or invalid response for model ${model}.`;
        continue;
      }

      const reply = extractGeminiReply(data);
      if (!reply) {
        lastStatus = 502;
        lastCode = 'upstream_service_error';
        lastError = `Gemini response did not contain a valid reply for model ${model}.`;
        continue;
      }

      return {
        status: 200,
        body: { reply },
      };
    } catch (error) {
      lastStatus = 502;
      lastCode = 'upstream_service_error';
      lastError = error instanceof Error ? error.message : `Gemini request failed unexpectedly for model ${model}.`;
    }
  }

  return {
    status: lastStatus,
    body: { error: lastError, code: lastCode },
  };
}
