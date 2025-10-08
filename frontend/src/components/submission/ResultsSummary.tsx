
import type { ExecutionResult } from '../../types';
import { Badge } from '../ui/badge';

interface ResultsSummaryProps {
  results: ExecutionResult[];
}

export function ResultsSummary({ results }: ResultsSummaryProps) {
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  const totalTime = results.reduce((sum, r) => sum + (r.execution_time || 0), 0);
  const maxMemory = Math.max(...results.map((r) => r.memory_used || 0));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={allPassed ? 'success' : 'destructive'} className="text-base px-4 py-1">
            {passedCount} / {totalCount} Test Cases Passed
          </Badge>
          {allPassed && (
            <span className="text-2xl">🎉</span>
          )}
        </div>

        {totalTime > 0 && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total Time: {totalTime}ms</span>
            <span>Max Memory: {maxMemory.toFixed(2)}MB</span>
          </div>
        )}
      </div>
    </div>
  );
}
