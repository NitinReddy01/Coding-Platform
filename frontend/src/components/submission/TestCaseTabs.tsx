import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TestCase, ExecutionResult } from '../../types';

interface TestCaseTabsProps {
  testCases: TestCase[];
  results?: ExecutionResult[];
  mode: 'input' | 'result';
}

export function TestCaseTabs({ testCases, results, mode }: TestCaseTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedTestCase = testCases[selectedIndex];
  const selectedResult = results?.[selectedIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Horizontal Tab Navigation */}
      <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border overflow-x-auto bg-gradient-to-r from-background via-card to-background">
        {testCases.map((_, index) => {
          const result = results?.[index];
          const isSelected = index === selectedIndex;

          return (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-smooth whitespace-nowrap relative',
                isSelected
                  ? mode === 'result' && result?.passed
                    ? 'bg-gradient-to-r from-success/20 to-success/10 text-success border-2 border-success shadow-glow hover:scale-[1.02]'
                    : mode === 'result' && result && !result.passed
                    ? 'bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive border-2 border-destructive shadow-card hover:scale-[1.02]'
                    : 'bg-gradient-primary text-primary-foreground border-2 border-primary shadow-glow-sm hover:scale-[1.02]'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.01] border-2 border-transparent'
              )}
            >
              <span>Case {index + 1}</span>
              {mode === 'result' && result && (
                result.passed ? (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/20">
                    <Check className="w-3 h-3 text-success" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive/20">
                    <X className="w-3 h-3 text-destructive" strokeWidth={3} />
                  </div>
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Test Case Content */}
      <div className="flex-1 overflow-auto p-4">
        {mode === 'input' ? (
          // Display test case input/expected output
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                  Input
                </span>
              </div>
              <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                {selectedTestCase?.input || 'No input'}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-success/10 text-success text-xs font-semibold uppercase tracking-wide">
                  Expected Output
                </span>
              </div>
              <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                {selectedTestCase?.expected_output}
              </pre>
            </div>
          </div>
        ) : (
          // Display test case result
          selectedResult && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={cn(
                  'rounded-lg p-3 border-2 flex items-center justify-between',
                  selectedResult.passed
                    ? 'bg-success/10 border-success/30'
                    : 'bg-destructive/10 border-destructive/30'
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedResult.passed ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <X className="w-5 h-5 text-destructive" />
                  )}
                  <span
                    className={cn(
                      'font-semibold',
                      selectedResult.passed ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {selectedResult.passed ? 'Accepted' : 'Wrong Answer'}
                  </span>
                </div>

                {/* Metrics */}
                {selectedResult.execution_time !== undefined && selectedResult.memory_used !== undefined && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Runtime: {selectedResult.execution_time}ms</span>
                    <span>Memory: {selectedResult.memory_used.toFixed(2)}MB</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                    Input
                  </span>
                </div>
                <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                  {selectedResult.input || 'No input'}
                </pre>
              </div>

              {/* Error or Output */}
              {selectedResult.error ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-destructive/20 text-destructive text-xs font-semibold uppercase tracking-wide">
                      Error
                    </span>
                  </div>
                  <pre className="rounded-lg bg-destructive/5 border border-destructive/30 p-3 font-mono text-sm text-destructive overflow-x-auto">
                    {selectedResult.is_timeout
                      ? 'Time Limit Exceeded'
                      : selectedResult.is_oom
                      ? 'Memory Limit Exceeded'
                      : selectedResult.error}
                  </pre>
                </div>
              ) : (
                <>
                  {/* Your Output */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-warning/10 text-warning text-xs font-semibold uppercase tracking-wide">
                        Your Output
                      </span>
                    </div>
                    <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                      {selectedResult.output}
                    </pre>
                  </div>

                  {/* Expected Output (only show if failed) */}
                  {!selectedResult.passed && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-success/10 text-success text-xs font-semibold uppercase tracking-wide">
                          Expected Output
                        </span>
                      </div>
                      <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                        {selectedResult.expected_output}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
