import { useState } from 'react';
import { CodeButton } from '../theme';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-sm sm:right-4">
      <div className="w-full">
        {isOpen && (
          <div className="mb-3">
            <ChatWindow onClose={() => setIsOpen(false)} />
          </div>
        )}
        <div className="flex justify-end">
          <CodeButton onClick={() => setIsOpen((current) => !current)}>
            {isOpen ? 'Hide Chat' : 'Open Chat'}
          </CodeButton>
        </div>
      </div>
    </div>
  );
}