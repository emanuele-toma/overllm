import { useConfig } from '@/hooks/config';
import { useEventChannel } from '@/hooks/eventChannel';
import { useOpenAIClient } from '@/hooks/openAI';
import { useResizeObserver } from '@/hooks/resizeObserver';
import { useEffect, useMemo, useState } from 'react';
import { ChatMessage } from '../../component/ChatMessage';
import { PromptInput } from '../../component/PromptInput';
import { useChatMessageStore } from '../../stores/chatMessageStore';

export function EphemeralChat() {
  const { config } = useConfig();

  const { message, setMessage } = useChatMessageStore();

  const [autoScroll, setAutoScroll] = useState<boolean>(config.autoScroll || true);
  const [promptRef, { height: promptHeight }] = useResizeObserver();

  const truePromptHeight = useMemo(() => {
    return promptRef.current?.getBoundingClientRect().height || promptHeight;
  }, [promptHeight, promptRef.current]);

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
      <div className={`p-4 bg-black rounded-xl border-1 border-neutral-700 w-full ${roundBorders}`} ref={promptRef}>
        <PromptInput
          client={client}
          onScrollChange={setAutoScroll}
          onSubmit={() => {
            setMessage('');
          }}
          onChunk={msg => {
            setMessage(prev => prev + msg);
          }}
        />
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
          <div
            className="py-4 pl-4 pr-2 bg-black rounded-xl rounded-t-none border-1 border-t-0 border-neutral-700 w-full "
            style={{
              maxHeight: `calc(100% - ${truePromptHeight + 149}px)`,
            }}
          >
            <div
              id="scroll"
              className="pr-2 overflow-y-auto h-full"
              style={{
                scrollbarColor: 'var(--color-neutral-700) transparent',
                scrollbarWidth: 'thin',
              }}
            >
              <ChatMessage message={message} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
