import { Check, X, Clock, MemoryStick } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ExecutionResult } from '../../types';

interface ResultsSummaryProps {
  results: ExecutionResult[];
}

export function ResultsSummary({ results }: ResultsSummaryProps) {
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;
  const passPercentage = (passedCount / totalCount) * 100;

  const totalTime = results.reduce((sum, r) => sum + (r.execution_time || 0), 0);
  const maxMemory = Math.max(...results.map((r) => r.memory_used || 0));

  return (
    <div className={cn(
      "rounded-lg border-2 p-4 transition-all",
      allPassed
        ? "bg-gradient-to-r from-success/10 via-success/5 to-transparent border-success/30 shadow-glow"
        : "bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border-destructive/30"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            allPassed ? "bg-success/20" : "bg-destructive/20"
          )}>
            {allPassed ? (
              <Check className="w-6 h-6 text-success" />
            ) : (
              <X className="w-6 h-6 text-destructive" />
            )}
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-bold",
              allPassed ? "text-success" : "text-destructive"
            )}>
              {allPassed ? "All Tests Passed!" : `${passedCount} / ${totalCount} Tests Passed`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {allPassed ? "Great job! Your solution is correct." : "Some test cases failed. Review your code."}
            </p>
          </div>
          {allPassed && (
            <span className="text-3xl animate-bounce">🎉</span>
          )}
        </div>

        {/* Runtime Metrics */}
        {totalTime > 0 && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <Clock className="w-4 h-4 text-primary" />
              <div className="text-xs">
                <div className="text-muted-foreground">Runtime</div>
                <div className="font-semibold text-foreground">{totalTime}ms</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <MemoryStick className="w-4 h-4 text-accent" />
              <div className="text-xs">
                <div className="text-muted-foreground">Memory</div>
                <div className="font-semibold text-foreground">{maxMemory.toFixed(2)}MB</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{passedCount} passed</span>
          <span>{totalCount - passedCount} failed</span>
        </div>
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              allPassed
                ? "bg-gradient-to-r from-success to-accent"
                : "bg-gradient-to-r from-primary to-warning"
            )}
            style={{ width: `${passPercentage}%` }}
          />
        </div>
        <div className="text-right text-xs font-semibold text-muted-foreground">
          {passPercentage.toFixed(0)}% Complete
        </div>
      </div>
    </div>
  );
}
