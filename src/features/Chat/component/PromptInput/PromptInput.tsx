import { AutoResizeTextarea } from '@/components/AutoResizeTextarea';
import { useConfig } from '@/hooks/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { useState } from 'react';

interface PromptInputProps {
  client: OpenAI | undefined;
  context?: string;
  autoClear?: boolean;
  onScrollChange?: (value: boolean) => void;
  onSubmit?: (prompt: string) => void;
  onChunk?: (message: string) => void;
  onChunkEnd?: () => void;
}

export function PromptInput({
  client,
  context = '',
  autoClear = false,
  onScrollChange,
  onSubmit,
  onChunk,
  onChunkEnd,
}: PromptInputProps) {
  const { config } = useConfig();

  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <AutoResizeTextarea
      id="prompt"
      autoFocus
      rows={1}
      className="bg-black text-white border-0 p-0 outline-none w-full max-h-32"
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

        if (autoClear) {
          setPrompt('');
        }

        onSubmit?.(prompt);
        setLoading(true);

        const wheel = (e: WheelEvent) => {
          if (e.deltaY < 0) onScrollChange?.(false);
          if (e.deltaY > 0) {
            const scroll = document.getElementById('scroll');
            if (!scroll) return;
            if (scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight <= scroll.clientHeight * 0.2)
              onScrollChange?.(true);
          }
        };

        window.addEventListener('wheel', wheel);

        try {
          const messages: ChatCompletionMessageParam[] = [];

          if (context) {
            messages.push({ role: 'system', content: context });
          }

          messages.push({ role: 'user', content: prompt });

          const stream = await client.chat.completions.create({
            model: config.model,
            messages: messages,
            stream: true,
          });

          for await (const chunk of stream) {
            onChunk?.(chunk.choices[0].delta.content ?? '');
          }
        } catch (error) {
          console.error('Error while streaming:', error);
          onChunk?.('Error while streaming');
        } finally {
          onChunkEnd?.();
        }

        if (config.autoScroll) onScrollChange?.(true);

        window.removeEventListener('wheel', wheel);

        setLoading(false);
      }}
    />
  );
}
