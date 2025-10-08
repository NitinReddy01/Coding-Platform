import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatTime, formatMemory } from '../../lib/utils';
import type { ExecutionResult } from '../../types';

interface TestCaseResultProps {
  result: ExecutionResult;
}

export function TestCaseResult({ result }: TestCaseResultProps) {
  const { passed, input, output, expected_output, error, execution_time, memory_used, is_timeout, is_oom } = result;

  return (
    <Card className={passed ? 'border-green-500' : 'border-red-500'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant={passed ? 'success' : 'destructive'}>
            {passed ? '✓ Passed' : '✗ Failed'}
          </Badge>
          {execution_time !== undefined && memory_used !== undefined && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>Time: {formatTime(execution_time)}</span>
              <span>Memory: {formatMemory(memory_used)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-muted-foreground">Input:</p>
          <pre className="mt-1 rounded bg-muted p-2 font-mono text-xs">{input || 'No input'}</pre>
        </div>

        {error ? (
          <div>
            <p className="font-semibold text-red-500">Error:</p>
            <pre className="mt-1 rounded bg-red-50 p-2 font-mono text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
              {is_timeout ? 'Time Limit Exceeded' : is_oom ? 'Memory Limit Exceeded' : error}
            </pre>
          </div>
        ) : (
          <>
            <div>
              <p className="font-semibold text-muted-foreground">Your Output:</p>
              <pre className="mt-1 rounded bg-muted p-2 font-mono text-xs">{output}</pre>
            </div>

            {!passed && (
              <div>
                <p className="font-semibold text-muted-foreground">Expected Output:</p>
                <pre className="mt-1 rounded bg-muted p-2 font-mono text-xs">{expected_output}</pre>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
