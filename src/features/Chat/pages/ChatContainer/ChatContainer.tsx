import { TbSettings } from 'react-icons/tb';
import { Link, Outlet } from 'react-router';
import { ChatList } from '../../component/ChatList';

export function ChatContainer() {
  return (
    <>
      <div className="absolute top-4 right-4">
        <Link to="/settings">
          <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 cursor-pointer active:transform active:scale-95">
            <TbSettings className="w-6 h-6" />
          </button>
        </Link>
      </div>
      <div className="flex flex-row gap-4 w-full justify-center items-start h-11/12 -ml-68">
        <ChatList />
        <div className="flex flex-col w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 overflow-hidden" style={{
          height: 'calc(100vh - 2rem)',
        }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
