import { fetch } from '@tauri-apps/plugin-http';
import OpenAI from 'openai';
import { useMemo } from 'react';

interface OpenAIClientProps {
  apiKey?: string;
  baseURL?: string;
}

export const useOpenAIClient = ({ apiKey, baseURL }: OpenAIClientProps) => {
  if (!apiKey || !baseURL) {
    return { client: undefined };
  }

  const client = useMemo(() => {
    return new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
      fetch: fetch,
      dangerouslyAllowBrowser: true,
    });
  }, [apiKey, baseURL]);

  return { client };
};
