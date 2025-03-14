import { useCallback, useEffect, useState } from 'react';

interface _Config {
  apiKey: string;
  baseURL: string;
  model: string;
}

type Config = Partial<_Config>;

const storageKey = 'config';

export const useConfig = () => {
  const [config, setConfig] = useState<Config>(() => {
    const storedConfig = localStorage.getItem(storageKey) || '{}';
    return JSON.parse(storedConfig);
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(config));
  }, [config, storageKey]);

  const setKey = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig(prevConfig => ({ ...prevConfig, [key]: value }));
  }, []);

  return { config, setKey };
};
