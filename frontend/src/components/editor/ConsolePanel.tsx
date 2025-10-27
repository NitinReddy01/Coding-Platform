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

        <TabsContent value="results" className="flex-1 mt-0">
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
            <div className="p-4 overflow-auto h-full">
              <div className="space-y-3">
                {/* Compact Status Bar */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                  status === 'accepted'
                    ? 'bg-success/10 border-success/30'
                    : 'bg-destructive/10 border-destructive/30'
                }`}>
                  {/* Status Icon & Text */}
                  <div className="flex items-center gap-2 flex-1">
                    {status === 'accepted' ? (
                      <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`font-semibold ${
                      status === 'accepted' ? 'text-success' : 'text-destructive'
                    }`}>
                      {status === 'accepted' ? 'Accepted' :
                       status === 'wrong_answer' ? 'Wrong Answer' :
                       status === 'time_limit_exceeded' ? 'Time Limit Exceeded' :
                       status === 'memory_limit_exceeded' ? 'Memory Limit Exceeded' :
                       status === 'runtime_error' ? 'Runtime Error' :
                       status === 'compilation_error' ? 'Compilation Error' : 'Failed'}
                    </span>
                    {status === 'accepted' && <span className="text-lg">🎉</span>}
                  </div>

                  {/* Test Cases */}
                  {testCasesPassed !== null && testCasesPassed !== undefined &&
                   testCasesTotal !== null && testCasesTotal !== undefined && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-muted/50 border border-border">
                      <span className="text-xs text-muted-foreground">Cases:</span>
                      <span className={`text-sm font-bold ${
                        testCasesPassed === testCasesTotal ? 'text-success' : 'text-warning'
                      }`}>
                        {testCasesPassed}/{testCasesTotal}
                      </span>
                    </div>
                  )}

                  {/* Runtime */}
                  {runtimeMs !== null && runtimeMs !== undefined && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-muted/50 border border-border">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                      </svg>
                      <span className="text-sm font-semibold text-foreground">{runtimeMs}ms</span>
                    </div>
                  )}

                  {/* Memory */}
                  {memoryUsedMb !== null && memoryUsedMb !== undefined && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-muted/50 border border-border">
                      <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2}/>
                        <rect x="9" y="9" width="6" height="6" strokeWidth={2}/>
                      </svg>
                      <span className="text-sm font-semibold text-foreground">{memoryUsedMb.toFixed(2)}MB</span>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                    <p className="text-xs font-semibold text-destructive mb-2">Error Details:</p>
                    <pre className="text-sm text-destructive font-mono whitespace-pre-wrap break-words bg-destructive/5 p-3 rounded border border-destructive/20 max-h-60 overflow-y-auto leading-relaxed">
                      {errorMessage}
                    </pre>
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

