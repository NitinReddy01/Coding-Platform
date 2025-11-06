import { Clock, MemoryStick, AlertCircle, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SubmissionStatus } from '../../types';

interface SubmissionStatusBannerProps {
  status: SubmissionStatus;
  runtimeMs?: number | null;
  memoryUsedMb?: number | null;
  errorMessage?: string | null;
}

export function SubmissionStatusBanner({
  status,
  runtimeMs,
  memoryUsedMb,
  errorMessage,
}: SubmissionStatusBannerProps) {
  // Status UI configuration
  const statusConfig = {
    pending: {
      icon: <Loader2 className="w-6 h-6 animate-spin text-primary" />,
      title: 'In Queue',
      description: 'Your submission is waiting to be processed...',
      bgClass: 'bg-muted/30 border-primary/30',
      textClass: 'text-foreground',
      emoji: undefined,
    },
    running: {
      icon: <Loader2 className="w-6 h-6 animate-spin text-primary" />,
      title: 'Running',
      description: 'Executing your code against test cases...',
      bgClass: 'bg-primary/10 border-primary/30',
      textClass: 'text-primary',
      emoji: undefined,
    },
    accepted: {
      icon: <Check className="w-6 h-6 text-success" />,
      title: 'Accepted',
      description: 'All test cases passed!',
      bgClass: 'bg-success/10 border-success/30',
      textClass: 'text-success',
      emoji: '🎉',
    },
    wrong_answer: {
      icon: <AlertCircle className="w-6 h-6 text-destructive" />,
      title: 'Wrong Answer',
      description: 'Some test cases failed. Review your logic.',
      bgClass: 'bg-destructive/10 border-destructive/30',
      textClass: 'text-destructive',
      emoji: undefined,
    },
    time_limit_exceeded: {
      icon: <Clock className="w-6 h-6 text-warning" />,
      title: 'Time Limit Exceeded',
      description: 'Your code took too long to execute.',
      bgClass: 'bg-warning/10 border-warning/30',
      textClass: 'text-warning',
      emoji: undefined,
    },
    memory_limit_exceeded: {
      icon: <MemoryStick className="w-6 h-6 text-warning" />,
      title: 'Memory Limit Exceeded',
      description: 'Your code used too much memory.',
      bgClass: 'bg-warning/10 border-warning/30',
      textClass: 'text-warning',
      emoji: undefined,
    },
    runtime_error: {
      icon: <AlertCircle className="w-6 h-6 text-destructive" />,
      title: 'Runtime Error',
      description: errorMessage || 'Your code encountered an error during execution.',
      bgClass: 'bg-destructive/10 border-destructive/30',
      textClass: 'text-destructive',
      emoji: undefined,
    },
    compilation_error: {
      icon: <AlertCircle className="w-6 h-6 text-destructive" />,
      title: 'Compilation Error',
      description: errorMessage || 'Your code failed to compile.',
      bgClass: 'bg-destructive/10 border-destructive/30',
      textClass: 'text-destructive',
      emoji: undefined,
    },
  };

  const config = statusConfig[status];
  const isProcessing = status === 'pending' || status === 'running';
  const showMetrics = !isProcessing && (runtimeMs !== null && runtimeMs !== undefined);

  return (
    <div className={cn(
      'rounded-lg border-2 p-6 transition-all',
      config.bgClass
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            isProcessing ? 'bg-primary/20' : status === 'accepted' ? 'bg-success/20' : 'bg-destructive/20'
          )}>
            {config.icon}
          </div>
          <div>
            <h3 className={cn('text-lg font-bold', config.textClass)}>
              {config.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
          {config.emoji && (
            <span className="text-3xl animate-bounce">{config.emoji}</span>
          )}
        </div>

        {/* Runtime Metrics (only show when complete) */}
        {showMetrics && (
          <div className="flex gap-3">
            {runtimeMs !== null && runtimeMs !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                <Clock className="w-4 h-4 text-primary" />
                <div className="text-xs">
                  <div className="text-muted-foreground">Runtime</div>
                  <div className="font-semibold text-foreground">{runtimeMs}ms</div>
                </div>
              </div>
            )}
            {memoryUsedMb !== null && memoryUsedMb !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                <MemoryStick className="w-4 h-4 text-accent" />
                <div className="text-xs">
                  <div className="text-muted-foreground">Memory</div>
                  <div className="font-semibold text-foreground">{memoryUsedMb.toFixed(2)}MB</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processing Animation */}
      {isProcessing && (
        <div className="mt-4">
          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-primary to-accent animate-pulse" />
          </div>
        </div>
      )}

      {/* Error Details */}
      {errorMessage && !isProcessing && (
        <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Error Details:</p>
          <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
            {errorMessage}
          </pre>
        </div>
      )}
    </div>
  );
}
