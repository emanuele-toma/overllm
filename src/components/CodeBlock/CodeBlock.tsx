import { HTMLAttributes, ReactNode, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TbCopy, TbCheck } from 'react-icons/tb';

interface CodeBlockProps {
  children: ReactNode;
  extra: HTMLAttributes<HTMLElement>;
}

export function CodeBlock({ children, extra }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  const language = extra.className?.replace('language-', '');
  const isMultiline = typeof children === 'string' && children.includes('\n');
  
  const handleCopy = async () => {
    if (typeof children === 'string') {
      try {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  if ((!language && !isMultiline) || typeof children !== 'string') {
    return <code className="font-mono bg-neutral-700 rounded-sm !px-1">{children}</code>;
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className="p-1! flex flex-col justify-center items-center rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <TbCheck className="w-4 h-4 text-green-500" />
          ) : (
            <TbCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <SyntaxHighlighter language={language || 'plaintext'} style={oneDark}>
        {children as string}
      </SyntaxHighlighter>
    </div>
  );
}