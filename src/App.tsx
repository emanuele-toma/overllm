import { router } from '@/routes';
import { RouterProvider } from 'react-router';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
