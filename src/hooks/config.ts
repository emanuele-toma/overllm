import { create } from 'zustand';

interface Config {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  runOnStartup: boolean;
  autoScroll: boolean;
  hotkey: string;
}

const storageKey = 'config';

const baseConfig: Config = {
  runOnStartup: false,
  autoScroll: false,
  hotkey: 'Alt+Space',
};

export const useConfig = create<{
  config: Config;
  setKey: <K extends keyof Config>(key: K, value: Config[K]) => void;
}>(set => {
  const storedConfig = localStorage.getItem(storageKey);
  const initialConfig = { ...baseConfig, ...(storedConfig ? JSON.parse(storedConfig) : {}) };

  return {
    config: initialConfig,
    setKey: (key, value) =>
      set(state => {
        const newConfig = { ...state.config, [key]: value };
        localStorage.setItem(storageKey, JSON.stringify(newConfig));
        return { config: newConfig };
      }),
  };
});
