import { Button } from '../ui/button';
import { LanguageSelector } from './LanguageSelector';


interface EditorToolbarProps {
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
}

export function EditorToolbar({ onRun, onSubmit, isRunning, isSubmitting }: EditorToolbarProps) {

  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
      <LanguageSelector />

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRun}
          disabled={isRunning || isSubmitting}
        >
          {isRunning ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Running...
            </>
          ) : (
            'Run Code'
          )}
        </Button>

        <Button
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </div>
  );
}
