import { AutoResizeTextarea } from '@/components/AutoResizeTextarea';
import { useConfig } from '@/hooks/config';
import OpenAI from 'openai';
import { useState } from 'react';
import { useChatMessageStore } from '../../stores/chatMessageStore';

interface PromptInputProps {
  client: OpenAI | undefined;
  setAutoScroll: (value: boolean) => void;
}

export function PromptInput({ client, setAutoScroll }: PromptInputProps) {
  const { config } = useConfig();
  const { setMessage } = useChatMessageStore();

  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  return (
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
  );
}
