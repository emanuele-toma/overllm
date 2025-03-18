import { AutoResizeTextarea } from '@/components/AutoResizeTextarea';
import { CodeBlock } from '@/components/CodeBlock/CodeBlock';
import { Divider } from '@/components/Divider';
import { useConfig } from '@/hooks/config';
import { useEventChannel } from '@/hooks/eventChannel';
import { useOpenAIClient } from '@/hooks/openAI';
import { useEffect, useState } from 'react';
import { TbSettings } from 'react-icons/tb';
import Markdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';
import { useChatMessageStore } from '../stores/chatMessageStore';

export function ChatRoutes() {
  const { config } = useConfig();

  const { message, setMessage } = useChatMessageStore();

  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(config.autoScroll || true);

  useEventChannel<{ focused: boolean }>('windowFocus', ({ focused }) => {
    if (focused) document.getElementById('prompt')?.focus();
  });

  const { client } = useOpenAIClient({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  useEffect(() => {
    const scroll = document.getElementById('scroll');
    if (!scroll) return;
    if (autoScroll && config.autoScroll) scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
  }, [message, autoScroll, config.autoScroll]);

  return (
    <>
      <div className="absolute top-4 right-4">
        <Link to="/settings">
          <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 cursor-pointer active:transform active:scale-95">
            <TbSettings className="w-6 h-6" />
          </button>
        </Link>
      </div>
      <div className="flex flex-col w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 overflow-hidden">
        <div
          className={`p-4 bg-black rounded-xl border-1 border-neutral-700 w-full ${message ? 'rounded-b-none' : ''}`}
        >
          <AutoResizeTextarea
            id="prompt"
            autoFocus
            rows={1}
            className="bg-black text-white border-0 p-0 outline-none w-full resize-none"
            placeholder="Type something..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={async e => {
              if (e.key !== 'Enter') return;
              if (!client || !config.model) return;
              if (e.shiftKey) return;

              e.preventDefault();
              e.stopPropagation();

              if (loading) return;

              setMessage('');
              setLoading(true);

              const wheel = (e: WheelEvent) => {
                if (e.deltaY < 0) setAutoScroll(false);
                if (e.deltaY > 0) {
                  const scroll = document.getElementById('scroll');
                  if (!scroll) return;
                  if (scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight <= scroll.clientHeight * 0.2)
                    setAutoScroll(true);
                }
              };
              window.addEventListener('wheel', wheel);

              const stream = await client.chat.completions.create({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
              });

              for await (const chunk of stream) {
                setMessage(prev => prev + chunk.choices[0].delta.content);
              }

              if (config.autoScroll) setAutoScroll(true);

              window.removeEventListener('wheel', wheel);

              setLoading(false);
            }}
          />
        </div>
        {(!client || !config.model) && (
          <>
            <Divider />
            <div className="m-4 p-4 bg-yellow-500/25  border-l-4 border-yellow-500 rounded-r-lg">
              <p>
                You need to provide an API key, base URL and Model to use the chat feature. Please check the settings
                page.
              </p>
            </div>
          </>
        )}

        {message && (
          <>
            <div className="py-4 pl-4 pr-1 bg-black rounded-xl rounded-t-none border-1 border-t-0 border-neutral-700 w-full h-5/6">
              <div
                id="scroll"
                className="pr-1 overflow-y-auto h-full"
                style={{
                  scrollbarColor: 'var(--color-neutral-700) transparent',
                  scrollbarWidth: 'thin',
                }}
              >
                <div className="px-4 bg-neutral-900 rounded-lg border-1 border-neutral-700 no-preflight">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ children, ...props }) => <CodeBlock extra={props}>{children}</CodeBlock>,
                    }}
                  >
                    {message}
                  </Markdown>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
