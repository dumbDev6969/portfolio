# Portfolio Project Documentation

## Overview

This project is a React + TypeScript + Vite portfolio built with a custom "code editor" visual style.  
The portfolio now includes:

- themed sections (Hero, About, Projects, Certifications, Contact)
- a floating chatbot widget with live Gemini integration
- a Web3Forms-powered contact form

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Styling/Theme:** CSS variables + reusable theme components
- **Icons:** react-icons
- **Fonts:** @fontsource/inter, @fontsource/jetbrains-mono
- **Backend runtime (for chat):** serverless-style API route + local Vite middleware
- **AI provider:** Google Gemini API

---

## Implemented Features

## 1) Contact Form (Web3Forms)

Implemented in [src/components/sections/Contact.tsx](C:/Users/joshu/Herd/portfolio/src/components/sections/Contact.tsx):

- moved from static HTML submit to async `onSubmit` flow
- sends `FormData` to Web3Forms endpoint
- uses `VITE_WEB3FORMS_KEY` from client env
- shows inline states/messages:
  - Sending...
  - Success! Message sent.
  - Error messages when request fails

---

## 2) Chatbot UI

Implemented in [src/components/chat/](C:/Users/joshu/Herd/portfolio/src/components/chat):

- [ChatWidget.tsx](C:/Users/joshu/Herd/portfolio/src/components/chat/ChatWidget.tsx): fixed floating launcher
- [ChatWindow.tsx](C:/Users/joshu/Herd/portfolio/src/components/chat/ChatWindow.tsx): chat panel, message list, input/send flow
- [ChatMessage.tsx](C:/Users/joshu/Herd/portfolio/src/components/chat/ChatMessage.tsx): message bubble renderer
- [index.ts](C:/Users/joshu/Herd/portfolio/src/components/chat/index.ts): exports

Behavior:

- fixed floating chat widget
- input + send button
- loading/disabled send state
- inline API error display
- auto-scroll to latest message

---

## 3) Chat Message Formatting (Gemini-like Rendering)

`ChatMessage` now formats markdown-like response content instead of showing raw markers like `**`.

Supported:

- bold text (`**text**`)
- inline code (`` `code` ``)
- bullet lists (`-`, `*`)
- numbered lists (`1.`, `2.`...)
- markdown headings (`#`, `##`, `###`)
- paragraph spacing

---

## 4) Chat Backend Integration

### Shared backend module (single source of truth)

[src/server/chatHandler.ts](C:/Users/joshu/Herd/portfolio/src/server/chatHandler.ts) contains shared logic used by both production and local dev:

- `buildSystemContext()`
- `mapHistoryToGemini(history)` (caps to last 6 turns)
- `callGeminiWithFallback(message, history, apiKey, primaryModel, fallbackModel)`

This module:

- builds portfolio-aware system context from:
  - [src/data/projects.json](C:/Users/joshu/Herd/portfolio/src/data/projects.json)
  - [src/data/certificates.json](C:/Users/joshu/Herd/portfolio/src/data/certificates.json)
- uses `technologies` field from projects data
- converts chat history to Gemini schema (`assistant` -> `model`)
- handles model fallback and standardized success/error responses

### Production API route

[api/chat.ts](C:/Users/joshu/Herd/portfolio/api/chat.ts) is now a thin handler:

- validates request method/body/origin
- delegates AI call to shared chat handler
- returns the existing contract unchanged:
  - success: `{ reply: string }`
  - error: `{ error: string }`

### Local dev API route

[vite.config.ts](C:/Users/joshu/Herd/portfolio/vite.config.ts) includes `local-chat-api-route` middleware so `/api/chat` also works in `vite dev`, using the same shared module.

---

## 5) Gemini Model Strategy

Model names are environment-driven:

- `GEMINI_MODEL` (primary)
- `GEMINI_MODEL_FALLBACK` (fallback)

If neither is set, last-resort default is:

- `gemini-2.5-flash-lite`

Model names with `models/...` prefix are normalized automatically.

---

## Environment Variables

Create a local `.env` file:

```env
# Contact form (client)
VITE_WEB3FORMS_KEY=your_web3forms_access_key

# Chat API (server-side usage)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
GEMINI_MODEL_FALLBACK=gemini-2.5-flash-lite

# Optional security hardening for production API
CHAT_ALLOWED_ORIGIN=https://your-domain.com
```

Notes:

- `GEMINI_*` and `CHAT_ALLOWED_ORIGIN` are server-side for API handling.
- Vite config now uses default env prefix behavior (no custom `envPrefix` override).
- `CHAT_ALLOWED_ORIGIN` is intended for deployed environments (set it to your public domain).
- In non-production runtime (`NODE_ENV !== production`), local origins (`localhost`, `127.0.0.1`) are explicitly allowed so local testing is not blocked.

---

## Request/Response Contract for `/api/chat`

Request:

```json
{
  "message": "Tell me about your stack",
  "history": [
    { "role": "user", "message": "Hi" },
    { "role": "assistant", "message": "Hello!" }
  ]
}
```

Response (success):

```json
{
  "reply": "..."
}
```

Response (error):

```json
{
  "error": "..."
}
```

---

## Running the Project

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

---

## Key Files

- App shell: [src/App.tsx](C:/Users/joshu/Herd/portfolio/src/App.tsx)
- Theme tokens/styles: [src/index.css](C:/Users/joshu/Herd/portfolio/src/index.css)
- Contact section: [src/components/sections/Contact.tsx](C:/Users/joshu/Herd/portfolio/src/components/sections/Contact.tsx)
- Chat UI: [src/components/chat/](C:/Users/joshu/Herd/portfolio/src/components/chat)
- Shared chat backend logic: [src/server/chatHandler.ts](C:/Users/joshu/Herd/portfolio/src/server/chatHandler.ts)
- Production chat API: [api/chat.ts](C:/Users/joshu/Herd/portfolio/api/chat.ts)
- Vite config + local dev API middleware: [vite.config.ts](C:/Users/joshu/Herd/portfolio/vite.config.ts)