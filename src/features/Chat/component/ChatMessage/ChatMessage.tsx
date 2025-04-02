import { CodeBlock } from '@/components/CodeBlock';
import { useState } from 'react';
import { TbCheck, TbCopy } from 'react-icons/tb';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: string;
  sender?: 'user' | 'assistant';
}

export function ChatMessage({ message, sender }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div
      className={`px-4 bg-neutral-900 rounded-lg border-1 border-neutral-700 no-preflight relative group ${sender === 'user' ? 'max-w-4/5 self-end' : 'self-start'}`}
    >
      <div
        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${sender === 'user' ? 'hidden' : ''}`}
      >
        <button
          onClick={handleCopy}
          className="p-1! flex flex-col justify-center items-center rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          {copied ? <TbCheck className="w-4 h-4 text-green-500" /> : <TbCopy className="w-4 h-4" />}
        </button>
      </div>

      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ children, ...props }) => <CodeBlock extra={props}>{children}</CodeBlock>,
        }}
      >
        {message || '...'}
      </Markdown>
    </div>
  );
}
