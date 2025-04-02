import { useConfig } from '@/hooks/config';
import { useEventChannel } from '@/hooks/eventChannel';
import { useOpenAIClient } from '@/hooks/openAI';
import { useResizeObserver } from '@/hooks/resizeObserver';
import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import { v4 } from 'uuid';
import { ChatMessage } from '../../component/ChatMessage';
import { PromptInput } from '../../component/PromptInput';
import { useChatHistory } from '../../hooks/useChatHistory';
import { ChatMessage as ChatMessageType } from '../../types/chatTypes';

export function PersistentChat() {
  const { config } = useConfig();

  const currentMessage = useRef<string>('');

  const { chatId = '' } = useParams();

  const { chatHistory, addHistoryMessage, updateHistoryMessage } = useChatHistory({
    chatId: chatId,
  });

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

  const messagePairs = chatHistory?.messages.reduce(
    (acc, _, index, arr) => {
      if (index % 2 === 0) {
        acc.push(arr.slice(index, index + 2) as [ChatMessageType, ChatMessageType]);
      }
      return acc;
    },
    [] as [ChatMessageType, ChatMessageType][],
  );

  useEffect(() => {
    document.getElementById('prompt')?.focus();

    const scroll = document.getElementById('scroll');
    if (!scroll) return;

    setTimeout(() => {
      scroll.scrollTo({ top: scroll.scrollHeight });
    }, 50);
  }, [chatId]);

  return (
    <>
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

      <div
        className="py-4 pl-4 pr-2 bg-black rounded-xl border-1 border-neutral-700 w-full max-h-full"
        style={{
          height: `calc(100% - ${truePromptHeight + 85}px)`,
        }}
      >
        <div
          id="scroll"
          className="pr-2 overflow-y-auto h-full flex flex-col gap-4"
          style={{
            scrollbarColor: 'var(--color-neutral-700) transparent',
            scrollbarWidth: 'thin',
          }}
        >
          {messagePairs?.map((messagePair, index) => (
            <div
              className={`flex flex-col gap-4 ${index === messagePairs.length - 1 ? 'min-h-full' : ''}`}
              key={`${messagePair[0].id}-${messagePair[1].id}`}
            >
              {messagePair.map(chatMessage => (
                <div className="flex flex-col" key={chatMessage.id}>
                  <ChatMessage message={chatMessage.content} sender={chatMessage.sender} />
                </div>
              ))}
            </div>
          ))}

          {messagePairs?.length === 0 && (
            <div className="flex items-center justify-center h-full text-neutral-500">(〜￣▽￣)〜 Wow, such empty!</div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center fixed bottom-16 left-0 right-0">
        <div
          className={`p-4 bg-black rounded-xl border-1 border-neutral-700 w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5`}
          ref={promptRef}
        >
          <PromptInput
            autoClear
            client={client}
            onSubmit={prompt => {
              addHistoryMessage({
                content: prompt,
                sender: 'user',
                timestamp: new Date(),
                id: v4(),
              });

              const newMessageId = v4();

              addHistoryMessage({
                content: '',
                sender: 'assistant',
                timestamp: new Date(),
                id: newMessageId,
              });

              currentMessage.current = newMessageId;

              setTimeout(() => {
                document.getElementById('scroll')?.scrollTo({ top: document.getElementById('scroll')?.scrollHeight });
              }, 100);
            }}
            onChunk={msg => {
              updateHistoryMessage(currentMessage.current, previous => ({
                ...previous,
                content: previous.content + msg,
              }));
            }}
            context={
              chatHistory?.messages
                .slice(-6)
                .map(message => `${message.sender}: ${message.content}`)
                .join('\n') ?? ''
            }
          />
        </div>
      </div>
    </>
  );
}
