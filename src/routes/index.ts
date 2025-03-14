import { Overlay } from '@/components/Overlay';
import { ChatRoutes } from '@/features/Chat/routes';
import { SettingsRoutes } from '@/features/Settings/routes';
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Overlay,
    children: [
      {
        path: '/',
        Component: ChatRoutes,
      },
      {
        path: '/settings',
        Component: SettingsRoutes,
      },
    ],
  },
]);
