import { type FormEvent, useEffect, useRef, useState } from 'react';
import { WindowCard } from '../theme';
import ChatMessage from './ChatMessage';
import { commandRegistry } from './commands';

type ChatWindowProps = {
  onClose: () => void;
};

type ChatRole = 'assistant' | 'user';

type ChatUiMessage = {
  role: ChatRole;
  message: string;
  timestamp: string;
  localOnly?: boolean;
};

type ChatHistoryTurn = {
  role: ChatRole;
  message: string;
};

const INITIAL_MESSAGES: ChatUiMessage[] = [
  {
    role: 'assistant' as const,
    message: 'Hey! I am joshua.exe. Ask me about projects, stack, or experience (or try `help`).',
    timestamp: '09:41',
  },
];

function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function toHistory(messages: ChatUiMessage[]): ChatHistoryTurn[] {
  return messages.filter((entry) => !entry.localOnly).map((entry) => ({
    role: entry.role,
    message: entry.message,
  }));
}

function getPayloadError(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = payload as Record<string, unknown>;
  return typeof value.error === 'string' && value.error.trim() ? value.error : null;
}

function getPayloadCode(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = payload as Record<string, unknown>;
  return typeof value.code === 'string' && value.code.trim() ? value.code : null;
}

function getPayloadReply(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = payload as Record<string, unknown>;
  return typeof value.reply === 'string' && value.reply.trim() ? value.reply : null;
}

function buildChatErrorMessage(status: number, code: string | null, fallbackMessage: string) {
  if (status === 429 && code === 'provider_quota_exceeded') {
    return 'The AI daily quota is exhausted right now. Please try again later.';
  }

  if (status === 429 && code === 'rate_limit_exceeded') {
    return 'You are sending messages too fast. Please wait a bit and try again.';
  }

  if (status >= 500 || code === 'misconfigured_server') {
    return 'Chat is temporarily unavailable due to backend configuration/service issues.';
  }

  return fallbackMessage;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatUiMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const messageContainer = messagesContainerRef.current;
    if (!messageContainer) {
      return;
    }
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }, [messages, isSending]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) {
      return;
    }

    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage) {
      setErrorMessage('Please type a message before sending.');
      return;
    }

    const normalizedMessage = trimmedMessage.toLowerCase();
    const commandHandler = commandRegistry[normalizedMessage];
    if (commandHandler) {
      let shouldClearChat = false;
      const responseMessage = commandHandler({
        clearChatHistory: () => {
          shouldClearChat = true;
        },
      });

      setErrorMessage('');
      setInputValue('');
      setMessages((current) => {
        const nextMessages = shouldClearChat ? [] : current;
        return [
          ...nextMessages,
          {
            role: 'assistant',
            message: responseMessage,
            timestamp: getCurrentTimeLabel(),
            localOnly: true,
          },
        ];
      });
      return;
    }

    const requestHistory = toHistory(messages);
    const userMessage: ChatUiMessage = {
      role: 'user',
      message: trimmedMessage,
      timestamp: getCurrentTimeLabel(),
    };

    setErrorMessage('');
    setInputValue('');
    setMessages((current) => [...current, userMessage]);
    setIsSending(true);

    void (async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmedMessage,
            history: requestHistory,
          }),
        });

        let payload: unknown = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          const apiError = getPayloadError(payload);
          const apiCode = getPayloadCode(payload);
          const fallbackError = apiError || `Request failed with status ${response.status}.`;
          setErrorMessage(buildChatErrorMessage(response.status, apiCode, fallbackError));
          return;
        }

        const reply = getPayloadReply(payload);
        if (!reply) {
          setErrorMessage('The assistant returned an empty reply.');
          return;
        }

        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            message: reply,
            timestamp: getCurrentTimeLabel(),
          },
        ]);
      } catch {
        setErrorMessage('Chat is currently unreachable. Please try again later.');
      } finally {
        setIsSending(false);
      }
    })();
  };

  return (
    <WindowCard label="joshua.exe">
      <div className="w-full max-w-[22rem] sm:max-w-sm">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <p className="font-mono text-[11px] text-[var(--text-comment)]">// status</p>
            <p className="text-xs text-[var(--text-secondary)]">{isSending ? 'thinking...' : 'online'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--border-subtle)] px-2 py-1 font-mono text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-blue)]/50 hover:text-[var(--accent-blue)]"
            aria-label="Close chat"
          >
            esc
          </button>
        </div>

        <div ref={messagesContainerRef} className="chat-scrollbar max-h-72 space-y-3 overflow-y-auto pr-1">
          {messages.map((entry, index) => (
            <ChatMessage
              key={`${entry.role}-${entry.timestamp}-${index}`}
              role={entry.role}
              message={entry.message}
              timestamp={entry.timestamp}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3">
          <label htmlFor="chat-input" className="block font-mono text-[11px] text-[var(--text-comment)]">
            // prompt
          </label>
          <div className="flex items-stretch gap-3">
            <input
              id="chat-input"
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Type a message..."
              className="h-10 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-inset)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none focus:border-[var(--accent-blue)]"
              disabled={isSending}
            />
            <button
              type="submit"
              className="h-10 rounded-md border border-[var(--accent-blue)]/40 bg-[var(--accent-blue)]/10 px-3 font-mono text-xs text-[var(--accent-blue)] transition-all duration-200 hover:border-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/15 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSending}
            >
              {isSending ? '>_...' : '>_Send'}
            </button>
          </div>
          <div className="flex items-center justify-start">
            <p className="text-[11px] text-[var(--text-secondary)]">
              {errorMessage ? <span className="text-[var(--syntax-string)]">{errorMessage}</span> : 'Ask about projects, stack, or experience.'}
            </p>
          </div>
        </form>
      </div>
    </WindowCard>
  );
}