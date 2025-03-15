import { HTMLAttributes, ReactNode } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: ReactNode;
  extra: HTMLAttributes<HTMLElement>;
}

export function CodeBlock({ children, extra }: CodeBlockProps) {
  console.log(typeof children);

  const language = extra.className?.replace('language-', '');
  const isMultiline = typeof children === 'string' && children.includes('\n');

  if ((!language && !isMultiline) || typeof children !== 'string') {
    return <code className="font-mono bg-neutral-700 rounded-sm !px-1">{children}</code>;
  }

  return (
    <SyntaxHighlighter language={language || 'plaintext'} style={oneDark}>
      {children as string}
    </SyntaxHighlighter>
  );
}
