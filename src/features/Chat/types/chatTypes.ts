export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatHistory {
  chatId: string;
  chatName: string;
  messages: ChatMessage[];
}

export interface ChatHistoryEntry {
  chatId: string;
  chatName: string;
}
