import { useEffect } from 'react';

export const isMac = () => {
  if (typeof window === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(window.navigator.platform);
};


export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    disabled?: boolean;
  } = {}
) {
  const { ctrlKey = false, shiftKey = false, altKey = false, disabled = false } = options;

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key matches
      const keyMatches = event.key === key || event.code === key;
      if (!keyMatches) return;

      // Check modifier keys
      // On Mac, metaKey is Cmd; on Windows/Linux, ctrlKey is Ctrl
      const modifierKey = isMac() ? event.metaKey : event.ctrlKey;
      const ctrlMatches = ctrlKey ? modifierKey : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatches = altKey ? event.altKey : !event.altKey;

      if (ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlKey, shiftKey, altKey, disabled]);
}
