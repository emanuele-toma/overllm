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

  const isBackgroundElement = (target: HTMLElement) => {
    if (target.id === 'overlay') return true;

    let parent = target.parentElement;
    while (parent) {
      const backgroundColor = window.getComputedStyle(parent).backgroundColor;
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        break;
      }
      if (parent.id === 'overlay') return true;
      parent = parent.parentElement;
    }
    return false;
  };

  return (
    <div
      id="overlay"
      className="flex flex-col py-8 items-center h-screen min-h-screen"
      onMouseDown={e => {
        const target = e.target as HTMLElement;
        if (!isBackgroundElement(target)) return;

        setCanClose(true);
      }}
      onMouseUp={e => {
        if (!canClose) return;
        setCanClose(false);

        const target = e.target as HTMLElement;
        if (!isBackgroundElement(target)) return;

        getCurrentWindow().hide();
        getCurrentWindow().minimize();
        dispatchWindowFocus({ focused: false });
      }}
    >
      <Outlet />
    </div>
  );
}
