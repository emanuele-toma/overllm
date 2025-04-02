import { Route, Routes } from 'react-router';
import { SettingsPage } from '../pages/SettingsPage';

export function SettingsRoutes() {
  return (
    <Routes>
      <Route index element={<SettingsPage />} />
    </Routes>
  );
}
