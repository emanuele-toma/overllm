import { CodeBlock } from '@/components/CodeBlock/CodeBlock';
import { useConfig } from '@/hooks/config';
import { useEventChannel } from '@/hooks/eventChannel';
import { useOpenAIClient } from '@/hooks/openAI';
import { useEffect, useState } from 'react';
import { TbSettings } from 'react-icons/tb';
import Markdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';
import { PromptInput } from '../component/PromptInput';
import { useChatMessageStore } from '../stores/chatMessageStore';

export function ChatRoutes() {
  const { config } = useConfig();

  const { message } = useChatMessageStore();

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

  const roundBorders = message || !client || !config.model ? 'rounded-b-none' : '';

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
        <div className={`p-4 bg-black rounded-xl border-1 border-neutral-700 w-full ${roundBorders}`}>
          <PromptInput client={client} setAutoScroll={setAutoScroll} />
        </div>
        {(!client || !config.model) && (
          <div className="bg-black rounded-xl rounded-t-none border-1 border-t-0 border-neutral-700 w-full">
            <div className="m-4 p-4 bg-yellow-500/25 rounded-lg">
              <p>
                You need to provide an API key, base URL and Model to use the chat feature. Please check the settings
                page.
              </p>
            </div>
          </div>
        )}

        {message && (
          <>
            <div className="py-4 pl-4 pr-2 bg-black rounded-xl rounded-t-none border-1 border-t-0 border-neutral-700 w-full h-5/6">
              <div
                id="scroll"
                className="pr-2 overflow-y-auto h-full"
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
