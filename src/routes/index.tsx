import { Overlay } from '@/components/Overlay';
import { ChatRoutes } from '@/features/Chat/routes';
import { SettingsRoutes } from '@/features/Settings/routes';
import { createBrowserRouter, Link, Navigate, useRouteError } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Overlay,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/',
        element: <Navigate to="/chats" replace />,
      },
      {
        path: '/chats/*',
        Component: ChatRoutes,
      },
      {
        path: '/settings',
        Component: SettingsRoutes,
      },
    ],
  },
]);

function ErrorElement() {
  const error = useRouteError();

  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <div className="bg-black border-1 border-neutral-700 w-3xs flex flex-col max-h-full overflow-hidden rounded-xl p-4">
        <h1 className="text-2xl font-bold">Oh no!</h1>
        <p className="mt-2 text-gray-400">It seems like something went wrong.</p>
        <div className="flex flex-row justify-center">
          <Link to="/" className="mt-4 px-4 py-2 bg-neutral-800 text-white rounded-xl">
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
