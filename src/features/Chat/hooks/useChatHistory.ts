import localforage from 'localforage';
import { useEffect, useState } from 'react';
import { ChatHistory, ChatMessage } from '../types/chatTypes';

interface useChatProps {
  chatId: string;
  chatName?: string;
}

export function useChatHistory({ chatId, chatName }: useChatProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistory>();

  useEffect(() => {
    async function getChatHistory() {
      const data = await localforage.getItem<ChatHistory>(`chatHistory_${chatId}`);

      setChatHistory(
        data ?? {
          chatId,
          chatName: chatName ?? 'Chat',
          messages: [],
        },
      );
    }

    getChatHistory();
  }, [chatId]);

  const addHistoryMessage = (message: ChatMessage) => {
    if (!chatHistory) return;

    setChatHistory(prev => {
      if (!prev) return prev;

      const updatedMessages = [...prev.messages, message];

      const updatedChatHistory = {
        ...prev,
        messages: updatedMessages,
      };

      localforage.setItem(`chatHistory_${chatId}`, updatedChatHistory).catch(error => {
        console.error('Error saving chat history:', error);
      });

      return updatedChatHistory;
    });
  };

  const updateHistoryMessage = (id: string, callback: (previous: ChatMessage) => ChatMessage) => {
    if (!chatHistory) return;

    setChatHistory(prev => {
      if (!prev) return prev;

      const updatedMessages = prev?.messages.map(message => {
        if (message.id === id) {
          return callback(message);
        }
        return message;
      });

      const updatedChatHistory = {
        ...prev,
        messages: updatedMessages,
      };

      localforage.setItem(`chatHistory_${chatId}`, updatedChatHistory).catch(error => {
        console.error('Error saving chat history:', error);
      });

      return updatedChatHistory;
    });
  };

  const renameChat = (name: string) => {
    if (!chatHistory) return;

    setChatHistory(prev => {
      if (!prev) return prev;

      const updatedChatHistory = {
        ...prev,
        chatName: name,
      };

      localforage.setItem(`chatHistory_${chatId}`, updatedChatHistory).catch(error => {
        console.error('Error saving chat history:', error);
      });

      return updatedChatHistory;
    });
  };

  return { chatHistory, addHistoryMessage, updateHistoryMessage, renameChat };
}
