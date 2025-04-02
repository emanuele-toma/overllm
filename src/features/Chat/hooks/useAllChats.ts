import localforage from 'localforage';
import { useEffect, useState } from 'react';
import { ChatHistory, ChatHistoryEntry } from '../types/chatTypes';

export function useAllChats() {
  const [chats, setChats] = useState<ChatHistoryEntry[]>([]);

  useEffect(() => {
    async function getChats() {
      const data = await localforage.getItem<string[]>('chatHistories');
      if (!data) return;
      const chatHistories: ChatHistoryEntry[] = [];

      for (const chatId of data) {
        const chat = await localforage.getItem<ChatHistoryEntry>(`chatHistory_${chatId}`);

        if (chat) {
          chatHistories.push({
            chatId: chat.chatId,
            chatName: chat.chatName,
          });
        }
      }

      setChats(chatHistories);
    }

    getChats();
  }, []);

  const addChat = (chat: ChatHistoryEntry) => {
    setChats(prevChats => [...prevChats, chat]);

    localforage.setItem<ChatHistory>(`chatHistory_${chat.chatId}`, { ...chat, messages: [] }).catch(error => {
      console.error('Error saving chat history:', error);
    });

    localforage.setItem<string[]>('chatHistories', [...chats.map(c => c.chatId), chat.chatId]).catch(error => {
      console.error('Error saving chat histories:', error);
    });
  };

  const removeChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.chatId !== chatId));

    localforage.removeItem(`chatHistory_${chatId}`).catch(error => {
      console.error('Error removing chat history:', error);
    });

    localforage
      .setItem<string[]>(
        'chatHistories',
        chats.map(c => c.chatId).filter(id => id !== chatId),
      )
      .catch(error => {
        console.error('Error saving chat histories:', error);
      });
  };

  return { chats, addChat, removeChat };
}
