import { create } from 'zustand';

type ChatMessageStore = {
  message: string;
  setMessage: (message: string | ((message: string) => string)) => void;
};

export const useChatMessageStore = create<ChatMessageStore>()(set => ({
  message: '',
  setMessage: message => set(state => ({ message: typeof message === 'function' ? message(state.message) : message })),
}));
