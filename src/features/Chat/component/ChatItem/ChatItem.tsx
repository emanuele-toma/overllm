import { useState } from 'react';
import { TbTrash } from 'react-icons/tb';
import { ChatHistoryEntry } from '../../types/chatTypes';

export interface ChatItemProps {
  chat: ChatHistoryEntry;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export function ChatItem({ chat, isActive, onClick, onDelete }: ChatItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center cursor-pointer ${
        isActive ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800'
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{chat.chatName}</span>
      {isHovered && (
        <TbTrash
          className="w-4 h-4 text-neutral-400 hover:text-red-400"
          onClick={e => {
            e.stopPropagation();
            onDelete?.(chat.chatId);
          }}
        />
      )}
    </button>
  );
}
