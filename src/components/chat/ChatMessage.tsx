import { type ReactNode } from 'react';

type ChatMessageProps = {
  role: 'assistant' | 'user';
  message: string;
  timestamp: string;
};

function renderInlineMarkdown(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={`bold-${index}`} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={`code-${index}`}
          className="rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] px-1 py-0.5 font-mono text-[12px] text-[var(--syntax-key)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    return <span key={`text-${index}`}>{token}</span>;
  });
}

function renderMessageBlocks(message: string) {
  const lines = message.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index].trim();

    if (!currentLine) {
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(currentLine)) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        if (!/^[-*]\s+/.test(candidate)) {
          break;
        }
        items.push(candidate.replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5 [overflow-wrap:anywhere]">
          {items.map((item, itemIndex) => (
            <li key={`ul-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(currentLine)) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        if (!/^\d+\.\s+/.test(candidate)) {
          break;
        }
        items.push(candidate.replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-1 pl-5 [overflow-wrap:anywhere]">
          {items.map((item, itemIndex) => (
            <li key={`ol-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^#{1,3}\s+/.test(currentLine)) {
      blocks.push(
        <p key={`heading-${index}`} className="font-semibold text-[var(--text-primary)]">
          {renderInlineMarkdown(currentLine.replace(/^#{1,3}\s+/, ''))}
        </p>
      );
      index += 1;
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (!candidate || /^[-*]\s+/.test(candidate) || /^\d+\.\s+/.test(candidate) || /^#{1,3}\s+/.test(candidate)) {
        break;
      }
      paragraphLines.push(candidate);
      index += 1;
    }

    blocks.push(
      <p key={`p-${index}`} className="whitespace-pre-wrap [overflow-wrap:anywhere]">
        {renderInlineMarkdown(paragraphLines.join(' '))}
      </p>
    );
  }

  return blocks;
}

export default function ChatMessage({ role, message, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg border px-3 py-2 ${
          isUser
            ? 'border-[var(--accent-blue)]/40 bg-[var(--accent-blue)]/10'
            : 'border-[var(--border-subtle)] bg-[var(--bg-card-inset)]'
        }`}
      >
        <p className="font-mono text-[11px] text-[var(--text-comment)]">// {role}</p>
        <div className="mt-1 space-y-2 break-words text-[13px] leading-relaxed text-[var(--text-primary)] [overflow-wrap:anywhere]">
          {renderMessageBlocks(message)}
        </div>
        <p className="mt-1 text-right font-mono text-[10px] text-[var(--text-secondary)]">{timestamp}</p>
      </div>
    </div>
  );
}