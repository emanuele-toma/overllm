import { useConfig } from '@/hooks/config';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

export function Overlay() {
  const { config } = useConfig();

  const [canClose, setCanClose] = useState(false);

  const dispatchWindowFocus = useEventChannel<{ focused: boolean }>('windowFocus');

  useEffect(() => {
    const currentWindow = getCurrentWindow();

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const unlisten = currentWindow.onFocusChanged(({ payload: isFocused }) => {
      if (import.meta.env.MODE === 'development') return;
      if (timeout !== null) clearTimeout(timeout);
      if (!isFocused) {
        timeout = setTimeout(() => {
          currentWindow.hide();
          currentWindow.minimize();
          dispatchWindowFocus({ focused: false });
        }, 100);
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
      window.removeEventListener('keydown', escapeHandler);
    };
  }, []);

  useEffect(() => {
    async function init() {
      const currentWindow = getCurrentWindow();

      if (await isRegistered(config.hotkey || 'Alt+Space')) {
        await unregister(config.hotkey || 'Alt+Space');
      }

      await register(config.hotkey || 'Alt+Space', async e => {
        if (e.state === 'Released') {
          const isMinimized = await currentWindow.isMinimized();
          const isVisible = await currentWindow.isVisible();

          if (isMinimized || !isVisible) {
            await currentWindow.unminimize();
            await currentWindow.show();
            await currentWindow.setFocus();
          } else {
            await currentWindow.hide();
            await currentWindow.minimize();
          }
        }
      });
    }

    init();

    return () => {
      unregister(config.hotkey || 'Alt+Space');
    };
  }, [config.hotkey]);

  return (
    <div
      className="flex flex-col py-8 items-center h-screen min-h-screen"
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
        dispatchWindowFocus({ focused: false });
      }}
    >
      <Outlet />
    </div>
  );
}
