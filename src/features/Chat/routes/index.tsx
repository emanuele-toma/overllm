import { AutoResizeTextarea } from '@/components/AutoResizeTextarea';
import { CodeBlock } from '@/components/CodeBlock/CodeBlock';
import { Divider } from '@/components/Divider';
import { useConfig } from '@/hooks/config';
import { useOpenAIClient } from '@/hooks/openAI';
import { useState } from 'react';
import { TbSettings } from 'react-icons/tb';
import Markdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';

export function ChatRoutes() {
  const [prompt, setPrompt] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const {
    config: { apiKey, baseURL },
  } = useConfig();

  const { client } = useOpenAIClient({
    apiKey,
    baseURL,
  });

  return (
    <>
      {/* Settings action icon in top right corner */}
      <div className="absolute top-4 right-4">
        <Link to="/settings">
          <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 cursor-pointer active:transform active:scale-95">
            <TbSettings className="w-6 h-6 text-white" />
          </button>
        </Link>
      </div>
      <div className="flex flex-col w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 bg-black rounded-xl border-1 border-neutral-700">
        <div className="p-4">
          <AutoResizeTextarea
            id="prompt"
            autoFocus
            rows={1}
            className="bg-black text-white border-0 p-0 outline-none w-full resize-none"
            placeholder="Type something..."
            disabled={loading}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={async e => {
              if (e.key !== 'Enter') return;
              if (!client) return;

              e.preventDefault();
              e.stopPropagation();

              setMessage('');
              setLoading(true);

              const stream = await client.chat.completions.create({
                model: 'gemini-2.0-flash',
                messages: [{ role: 'user', content: prompt }],
                stream: true,
              });

              for await (const chunk of stream) {
                setMessage(prev => prev + chunk.choices[0].delta.content);
              }

              setLoading(false);

              document.getElementById('prompt')?.focus();
            }}
          />
        </div>
        {!client && (
          // Give the user a warning in a block quote, light yellow background, hard yellow left border, and black text
          <>
            <Divider />
            <div className="m-4 p-4 bg-yellow-500/25  border-l-4 border-yellow-500 rounded-r-lg">
              <p>
                You need to provide an API key and base URL to use the chat feature. Please check the settings page.
              </p>
            </div>
          </>
        )}

        {loading && (
          <div className="p-4">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-700"></div>
            </div>
          </div>
        )}

        {message && !loading && (
          <>
            <Divider />
            <div className="p-4">
              <div className="px-4 bg-neutral-900 rounded-lg border-1 border-neutral-700 no-preflight">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                  }}
                >
                  {message}
                </Markdown>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
