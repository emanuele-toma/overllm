import { Route, Routes } from 'react-router';
import { ChatContainer } from '../pages/ChatContainer';
import { EphemeralChat } from '../pages/EphemeralChat';
import { PersistentChat } from '../pages/PersistentChat/PersistentChat';

export function ChatRoutes() {
  return (
    <Routes>
      <Route path="*" element={<ChatContainer />}>
        <Route index element={<EphemeralChat />} />
        <Route path=":chatId" element={<PersistentChat />} />
      </Route>
    </Routes>
  );
}
