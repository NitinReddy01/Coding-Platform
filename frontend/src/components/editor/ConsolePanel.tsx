import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { TestCaseResult } from '../submission/TestCaseResult';
import { ResultsSummary } from '../submission/ResultsSummary';
import type { TestCase, ExecutionResult } from '../../types';

interface ConsolePanelProps {
  sampleTestCases: TestCase[];
  results: ExecutionResult[];
  error: string | null;
}

export function ConsolePanel({ sampleTestCases, results, error }: ConsolePanelProps) {

  return (
    <div className="h-full flex flex-col border-t border-border">
      <Tabs defaultValue="testcases" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b">
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          <TabsTrigger value="results">
            Results {results.length > 0 && `(${results.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testcases" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-4">
            {sampleTestCases.map((testCase, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground mb-1">
                        Test Case {index + 1}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Input:</p>
                      <pre className="mt-1 rounded bg-muted p-2 font-mono text-xs">
                        {testCase.input}
                      </pre>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Expected Output:</p>
                      <pre className="mt-1 rounded bg-muted p-2 font-mono text-xs">
                        {testCase.expected_output}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="flex-1 overflow-auto p-4 mt-0">
          {error ? (
            <Card className="border-red-500">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold text-red-500 mb-2">Error:</p>
                <pre className="text-sm text-red-700 dark:text-red-300">{error}</pre>
              </CardContent>
            </Card>
          ) : results.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Run your code to see results here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <ResultsSummary results={results} />
              {results.map((result, index) => (
                <TestCaseResult key={index} result={result} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
