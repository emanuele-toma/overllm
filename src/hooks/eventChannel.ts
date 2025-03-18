import { useCallback, useEffect } from 'react';

export function useEventChannel<T>(eventKey: string, callback?: (data: T) => void) {
  useEffect(() => {
    const listener = (event: CustomEvent) => {
      callback?.(event.detail);
    };

    window.addEventListener(eventKey, listener as EventListener);

    return () => {
      window.removeEventListener(eventKey, listener as EventListener);
    };
  }, [eventKey, callback]);

  const publish = useCallback(
    (data: T) => {
      const event = new CustomEvent(eventKey, { detail: data });
      window.dispatchEvent(event);
    },
    [eventKey],
  );

  return publish;
}
