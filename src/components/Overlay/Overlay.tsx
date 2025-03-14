import { getCurrentWindow } from '@tauri-apps/api/window';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

export function Overlay() {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const currentWindow = getCurrentWindow();

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const unlisten = currentWindow.onFocusChanged(({ payload: isFocused }) => {
      if (timeout !== null) clearTimeout(timeout);
      if (!isFocused) {
        timeout = setTimeout(() => {
          currentWindow.hide();
          currentWindow.minimize();
        }, 100);
      }
    });

    register('Alt+Space', async e => {
      if (e.state === 'Released') {
        const isMinimized = await currentWindow.isMinimized();

        if (isMinimized) {
          await currentWindow.unminimize();
          await currentWindow.show();
          await currentWindow.setFocus();
          document.getElementById('prompt')?.focus();
        } else {
          await currentWindow.hide();
          await currentWindow.minimize();
        }
      }
    });

    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        currentWindow.hide();
        currentWindow.minimize();
      }
    };

    window.addEventListener('keydown', escapeHandler);

    return () => {
      unlisten.then(fn => fn());
      unregister('Alt+Space');
      window.removeEventListener('keydown', escapeHandler);
    };
  }, []);

  return (
    <div
      className="flex flex-col py-8 items-center min-h-screen"
      onMouseDown={e => {
        if (e.target !== e.currentTarget) return;
        setCanClose(true);
      }}
      onMouseUp={e => {
        if (!canClose) return;
        setCanClose(false);

        if (e.target !== e.currentTarget) return;
        getCurrentWindow().hide();
        getCurrentWindow().minimize();
      }}
    >
      <Outlet />
    </div>
  );
}
