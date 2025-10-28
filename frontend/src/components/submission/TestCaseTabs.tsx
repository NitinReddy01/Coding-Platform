import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TestCase, ExecutionResult } from '../../types';

interface TestCaseTabsProps {
  testCases: TestCase[];
  results?: ExecutionResult[];
  mode: 'input' | 'result';
  errorMessage?: string | null;
}

export function TestCaseTabs({ testCases, results, mode, errorMessage }: TestCaseTabsProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-border bg-gradient-to-r from-background via-card to-background">
        <h3 className="text-sm font-semibold text-foreground">
          {mode === 'result' ? 'Test Results' : 'Sample Test Cases'}
          <span className="text-muted-foreground ml-2">({testCases.length} {testCases.length === 1 ? 'case' : 'cases'})</span>
        </h3>
      </div>

      {/* Global Error Banner for Compilation Errors */}
      {mode === 'result' && errorMessage && (
        <div className="mx-4 mt-4">
          <div className="rounded-lg bg-destructive/10 border-2 border-destructive/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-destructive">Compilation Error</p>
            </div>
            <pre className="text-sm text-destructive font-mono whitespace-pre-wrap break-words bg-destructive/5 p-3 rounded border border-destructive/20 max-h-60 overflow-y-auto leading-relaxed">
              {errorMessage}
            </pre>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {testCases.map((testCase, index) => {
            const result = results?.[index];

            return (
              <div
                key={index}
                className={cn(
                  'rounded-lg border-2 overflow-hidden transition-colors',
                  mode === 'result' && result?.passed && 'border-success/40 bg-success/5',
                  mode === 'result' && result && !result.passed && 'border-destructive/40 bg-destructive/5',
                  mode === 'input' && 'border-border bg-card'
                )}
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                  <span className="font-semibold text-foreground">
                    Case {index + 1}
                  </span>

                  {/* Status Badge */}
                  {mode === 'result' && result && (
                    <>
                      {result.passed ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          <span className="text-xs font-semibold">Passed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/20 text-destructive">
                          <X className="w-3.5 h-3.5" strokeWidth={3} />
                          <span className="text-xs font-semibold">Failed</span>
                        </div>
                      )}

                      {/* Metrics */}
                      {result.execution_time !== undefined && result.memory_used !== undefined && (
                        <>
                          <span className="text-muted-foreground text-xs">·</span>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-mono">{result.execution_time}ms</span>
                            <span className="font-mono">{(result.memory_used / 1024).toFixed(2)}MB</span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-4">
                  {mode === 'input' ? (
                    // Display test case input/expected output
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                            Input
                          </span>
                        </div>
                        <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                          {testCase.input || 'No input'}
                        </pre>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-success/10 text-success text-xs font-semibold uppercase tracking-wide">
                            Expected Output
                          </span>
                        </div>
                        <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                          {testCase.expected_output}
                        </pre>
                      </div>
                    </>
                  ) : (
                    // Display test case result
                    result && (
                      <>
                        {/* Input */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                              Input
                            </span>
                          </div>
                          <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                            {result.input || 'No input'}
                          </pre>
                        </div>

                        {/* Error or Output */}
                        {result.error ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-destructive/20 text-destructive text-xs font-semibold uppercase tracking-wide">
                                Error
                              </span>
                            </div>
                            <pre className="rounded-lg bg-destructive/5 border border-destructive/30 p-3 font-mono text-sm text-destructive overflow-x-auto">
                              {result.error}
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
                                {result.actual_output}
                              </pre>
                            </div>

                            {/* Expected Output (always show unless error) */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded bg-success/10 text-success text-xs font-semibold uppercase tracking-wide">
                                  Expected Output
                                </span>
                              </div>
                              <pre className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-sm text-foreground overflow-x-auto">
                                {result.expected_output}
                              </pre>
                            </div>
                          </>
                        )}
                      </>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
