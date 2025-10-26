import { memo } from 'react';
import { Play, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { LanguageSelector } from './LanguageSelector';
import { KeyboardBadge } from '../ui/KeyboardBadge';


interface EditorToolbarProps {
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  isPolling?: boolean;
}

function EditorToolbarComponent({ onRun, onSubmit, isRunning, isSubmitting, isPolling = false }: EditorToolbarProps) {

  return (
    <div className="flex items-center justify-between border-b-2 border-border bg-gradient-to-r from-background via-card to-background px-4 py-3 shadow-sm">
      <LanguageSelector />

      <div className="flex gap-3">
        <Button
          variant="warning"
          onClick={onRun}
          disabled={isRunning || isSubmitting || isPolling}
          size="default"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" fill="currentColor" />
              Run Code
              <KeyboardBadge shortcut="Quote" withCtrl />
            </>
          )}
        </Button>

        <Button
          variant="success"
          onClick={onSubmit}
          disabled={isRunning || isSubmitting || isPolling}
          size="default"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" strokeWidth={3} />
              Submit
              <KeyboardBadge shortcut="Enter" withCtrl />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when parent changes unrelated state
export const EditorToolbar = memo(EditorToolbarComponent);
