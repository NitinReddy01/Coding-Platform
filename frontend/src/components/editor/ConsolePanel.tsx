import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { TestCaseTabs } from '../submission/TestCaseTabs';
import { ResultsSummary } from '../submission/ResultsSummary';
import { StatusBadge } from '../submission/StatusBadge';
import type { TestCase, ExecutionResult, SubmissionStatus, SubmissionType } from '../../types';

interface ConsolePanelProps {
  sampleTestCases: TestCase[];
  results: ExecutionResult[];
  error: string | null;
  status: SubmissionStatus | null;
  isPolling: boolean;
  runtimeMs?: number | null;
  memoryUsedMb?: number | null;
  testCasesPassed?: number | null;
  testCasesTotal?: number | null;
  errorMessage?: string | null;
  submissionType: SubmissionType | null;
}

export function ConsolePanel({ sampleTestCases, results, error, status, isPolling, runtimeMs, memoryUsedMb, testCasesPassed, testCasesTotal, errorMessage, submissionType }: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<'testcases' | 'results'>('testcases');

  // Auto-switch tabs based on submission type
  useEffect(() => {
    if (submissionType === 'run') {
      setActiveTab('testcases');
    } else if (submissionType === 'submit') {
      setActiveTab('results');
    }
  }, [submissionType]);

  return (
    <div className="h-full flex flex-col border-t border-border bg-card relative">
      {/* Floating status badge in top-right corner */}
      {status && (
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={status} />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'testcases' | 'results')} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent">
          <TabsTrigger value="testcases" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Test Cases
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Results {results.length > 0 && `(${results.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testcases" className="flex-1 mt-0 overflow-hidden">
          <TestCaseTabs testCases={sampleTestCases} mode="input" />
        </TabsContent>

        <TabsContent value="results" className="flex-1 mt-0 overflow-hidden">
          {error ? (
            <div className="p-4">
              <div className="rounded-lg bg-destructive/10 border-2 border-destructive/30 p-4">
                <p className="text-sm font-semibold text-destructive mb-2">Error:</p>
                <pre className="text-sm text-destructive font-mono">{error}</pre>
              </div>
            </div>
          ) : !status || (status === 'pending' || status === 'running') ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-4xl">💻</div>
                <p className="text-sm text-muted-foreground">
                  {isPolling ? 'Processing your submission...' : 'Run your code to see results here'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 overflow-auto h-full">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Status Banner */}
                <div className={`rounded-xl p-6 border-2 transition-all ${
                  status === 'accepted'
                    ? 'bg-gradient-to-br from-success/20 via-success/10 to-success/5 border-success/40 shadow-lg shadow-success/20'
                    : status === 'wrong_answer'
                    ? 'bg-gradient-to-br from-destructive/20 via-destructive/10 to-destructive/5 border-destructive/40 shadow-lg shadow-destructive/20'
                    : status === 'time_limit_exceeded'
                    ? 'bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5 border-warning/40 shadow-lg shadow-warning/20'
                    : status === 'memory_limit_exceeded'
                    ? 'bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5 border-warning/40 shadow-lg shadow-warning/20'
                    : 'bg-gradient-to-br from-destructive/20 via-destructive/10 to-destructive/5 border-destructive/40 shadow-lg shadow-destructive/20'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        status === 'accepted'
                          ? 'bg-success/30 text-success'
                          : 'bg-destructive/30 text-destructive'
                      }`}>
                        {status === 'accepted' ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold ${
                          status === 'accepted' ? 'text-success' : 'text-destructive'
                        }`}>
                          {status === 'accepted' ? 'Accepted!' :
                           status === 'wrong_answer' ? 'Wrong Answer' :
                           status === 'time_limit_exceeded' ? 'Time Limit Exceeded' :
                           status === 'memory_limit_exceeded' ? 'Memory Limit Exceeded' :
                           status === 'runtime_error' ? 'Runtime Error' :
                           status === 'compilation_error' ? 'Compilation Error' : 'Failed'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {status === 'accepted' ? 'All test cases passed!' :
                           status === 'wrong_answer' ? 'Some test cases failed' :
                           status === 'time_limit_exceeded' ? 'Your code took too long to execute' :
                           status === 'memory_limit_exceeded' ? 'Your code used too much memory' :
                           'Check the details below'}
                        </p>
                      </div>
                      {status === 'accepted' && (
                        <span className="text-4xl ml-2 animate-bounce">🎉</span>
                      )}
                    </div>
                  </div>

                  {/* Test Cases Progress */}
                  {testCasesPassed !== null && testCasesPassed !== undefined &&
                   testCasesTotal !== null && testCasesTotal !== undefined && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Test Cases</span>
                        <span className={`text-lg font-bold ${
                          testCasesPassed === testCasesTotal ? 'text-success' : 'text-warning'
                        }`}>
                          {testCasesPassed} / {testCasesTotal}
                        </span>
                      </div>
                      <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                            testCasesPassed === testCasesTotal
                              ? 'bg-gradient-to-r from-success to-success/70'
                              : 'bg-gradient-to-r from-warning to-warning/70'
                          }`}
                          style={{ width: `${(testCasesPassed / testCasesTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {(runtimeMs !== null && runtimeMs !== undefined) && (
                    <div className="flex gap-4 mt-4">
                      <div className="flex-1 rounded-lg bg-card/60 border border-border/50 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                          </svg>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Runtime</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{runtimeMs}ms</div>
                      </div>
                      {memoryUsedMb !== null && memoryUsedMb !== undefined && (
                        <div className="flex-1 rounded-lg bg-card/60 border border-border/50 p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2}/>
                              <rect x="9" y="9" width="6" height="6" strokeWidth={2}/>
                            </svg>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Memory</span>
                          </div>
                          <div className="text-2xl font-bold text-foreground">{memoryUsedMb.toFixed(2)}MB</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="rounded-lg bg-destructive/10 border-2 border-destructive/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                      </svg>
                      <p className="text-sm font-semibold text-destructive">Error Details</p>
                    </div>
                    <pre className="text-sm text-destructive font-mono whitespace-pre-wrap break-words bg-destructive/5 p-3 rounded border border-destructive/20">
                      {errorMessage}
                    </pre>
                  </div>
                )}

                {/* Tips */}
                {status !== 'accepted' && (
                  <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary mb-1">Tips</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          {status === 'wrong_answer' && (
                            <>
                              <li>Check your algorithm logic and edge cases</li>
                              <li>Review the problem constraints carefully</li>
                              <li>Test with custom inputs using the Run button</li>
                            </>
                          )}
                          {status === 'time_limit_exceeded' && (
                            <>
                              <li>Consider optimizing your algorithm's time complexity</li>
                              <li>Look for nested loops that could be reduced</li>
                              <li>Try using more efficient data structures</li>
                            </>
                          )}
                          {status === 'memory_limit_exceeded' && (
                            <>
                              <li>Review your memory allocations</li>
                              <li>Consider using space-efficient data structures</li>
                              <li>Look for unnecessary data duplication</li>
                            </>
                          )}
                          {(status === 'runtime_error' || status === 'compilation_error') && (
                            <>
                              <li>Check the error message above for details</li>
                              <li>Verify your syntax is correct</li>
                              <li>Look for potential null/undefined references</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

