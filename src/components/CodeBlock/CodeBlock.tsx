import { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  children: ReactNode;
}

export function CodeBlock({ children }: CodeBlockProps) {
  const value = renderToStaticMarkup(children);

  const clean = value
    .replace(/^<code class="language-.*?">/, "")
    .replace(/<\/code>$/, "");

  const unescaped =
    new DOMParser().parseFromString(clean, "text/html").documentElement
      .textContent || "";

  const language =
    value.split('class="')?.[1]?.split("language-")?.[1]?.split('"')?.[0] ||
    "plaintext";

  return (
    <SyntaxHighlighter language={language} style={oneDark}>
      {unescaped}
    </SyntaxHighlighter>
  );
}
