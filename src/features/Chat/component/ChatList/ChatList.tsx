import { TbPlus } from 'react-icons/tb';
import { useNavigate, useParams } from 'react-router';
import { v4 } from 'uuid';
import { useAllChats } from '../../hooks/useAllChats';
import { ChatItem } from '../ChatItem';

export function ChatList() {
  const { chats, addChat, removeChat } = useAllChats();
  const { chatId } = useParams();

  const navigate = useNavigate();

  const handleNewChat = () => {
    const newChat = {
      chatId: v4(),
      chatName: `New Chat ${chats.length + 1}`,
    };
    addChat(newChat);
    navigate(`/chats/${newChat.chatId}`);
  };

  const hasChats = chats.length > 0;

  return (
    <div className="h-full">
      <div
        className={`bg-black border-1 border-neutral-700 w-3xs 'flex flex-col max-h-full overflow-hidden rounded-xl`}
      >
        <div className={`flex justify-between items-center p-4 ${hasChats ? 'border-b border-neutral-700' : ''}`}>
          <h2 className="font-medium text-white">Chats</h2>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
            aria-label="New Chat"
          >
            <TbPlus className="w-5 h-5 text-neutral-300" />
          </button>
        </div>

        {hasChats && (
          <div
            className="flex-1 max-h-[calc(100dvh_-_16rem)] overflow-y-auto p-2 mr-1 my-1 space-y-1"
            style={{
              scrollbarColor: 'var(--color-neutral-700) transparent',
              scrollbarWidth: 'thin',
            }}
          >
            {chats.map(chat => (
              <ChatItem
                key={chat.chatId}
                chat={chat}
                isActive={chat.chatId === chatId}
                onClick={() => {
                  if (chatId === chat.chatId) {
                    navigate(`/chats`);
                    return;
                  }

                  navigate(`/chats/${chat.chatId}`);
                }}
                onDelete={() => {
                  if (chatId === chat.chatId) {
                    navigate(`/chats`);
                  }
                  removeChat(chat.chatId);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
