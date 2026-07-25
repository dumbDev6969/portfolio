import { useState } from 'react';
import { CodeButton } from '../theme';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 sm:left-auto sm:right-4">
      <div className="mx-auto w-full max-w-sm sm:mx-0 sm:ml-auto">
        {isOpen && (
          <div className="mb-3">
            <ChatWindow onClose={() => setIsOpen(false)} />
          </div>
        )}
        <div className="flex justify-start">
          <CodeButton onClick={() => setIsOpen((current) => !current)}>
            {isOpen ? 'Hide Chat' : 'Open Chat'}
          </CodeButton>
        </div>
      </div>
    </div>
  );
}