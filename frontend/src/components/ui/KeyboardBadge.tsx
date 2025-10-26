import { isMac } from '../../hooks/useKeyboardShortcut';

interface KeyboardBadgeProps {
  /**
   * The keyboard shortcut to display
   * Examples: 'Enter', 'Quote' (for ')
   */
  shortcut: string;
  /**
   * Whether Ctrl/Cmd key is required
   */
  withCtrl?: boolean;
  /**
   * Whether Shift key is required
   */
  withShift?: boolean;
}

/**
 * Displays a keyboard shortcut badge with platform-aware modifier keys
 */
export function KeyboardBadge({ shortcut, withCtrl = false, withShift = false }: KeyboardBadgeProps) {
  const modifierKey = isMac() ? '⌘' : 'Ctrl';

  // Map common key names to symbols
  const keySymbols: Record<string, string> = {
    Enter: '↵',
    Quote: "'",
    Backspace: '⌫',
    Delete: '⌦',
    Escape: 'Esc',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
  };

  const keyDisplay = keySymbols[shortcut] || shortcut;

  return (
    <span className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-background/50 border border-border text-[10px] font-mono text-muted-foreground">
      {withCtrl && <span>{modifierKey}</span>}
      {withShift && <span>⇧</span>}
      <span>{keyDisplay}</span>
    </span>
  );
}
