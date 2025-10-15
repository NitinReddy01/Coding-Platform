import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { TestCaseTabs } from '../submission/TestCaseTabs';
import { ResultsSummary } from '../submission/ResultsSummary';
import type { TestCase, ExecutionResult } from '../../types';

interface ConsolePanelProps {
  sampleTestCases: TestCase[];
  results: ExecutionResult[];
  error: string | null;
}

export function ConsolePanel({ sampleTestCases, results, error }: ConsolePanelProps) {

  return (
    <div className="h-full flex flex-col border-t border-border bg-card">
      <Tabs defaultValue="testcases" className="flex-1 flex flex-col">
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
          ) : results.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-4xl">💻</div>
                <p className="text-sm text-muted-foreground">
                  Run your code to see results here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <ResultsSummary results={results} />
              </div>
              <div className="flex-1 overflow-hidden">
                <TestCaseTabs testCases={sampleTestCases} results={results} mode="result" />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

