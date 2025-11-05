/**
 * ValidatorTestResults Component
 *
 * Displays the results of testing a custom validator against all test cases.
 * Shows pass/fail status for each test case with error messages when applicable.
 * Groups sample and hidden test cases for better organization.
 *
 * @module components/problem-form/ValidatorTestResults
 */

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { ValidatorTestResult } from '../../api/problems';

interface ValidatorTestResultsProps {
  /** Array of test results from validator testing */
  results: ValidatorTestResult[];
  /** Overall validation status */
  valid: boolean;
  /** Optional message from validation */
  message?: string;
}

/**
 * ValidatorTestResults displays validation test results with grouping
 *
 * @param props - Component props
 * @param props.results - Array of test results
 * @param props.valid - Overall validation status
 * @param props.message - Optional message from validation
 *
 * @example
 * ```tsx
 * <ValidatorTestResults
 *   results={testResults}
 *   valid={true}
 *   message="Validator passed all test cases"
 * />
 * ```
 */
export function ValidatorTestResults({
  results,
  valid,
  message,
}: ValidatorTestResultsProps) {
  // Group results by sample/hidden
  const sampleResults = results.filter((r) => r.is_sample);
  const hiddenResults = results.filter((r) => !r.is_sample);

  // Render test case result
  const renderTestCase = (result: ValidatorTestResult, index: number) => (
    <div
      key={result.test_case_id || index}
      className={`p-4 rounded-lg border ${
        result.passed
          ? 'bg-card border-border'
          : 'bg-destructive/5 border-destructive/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {result.passed ? (
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-1" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-text">
              {result.is_sample ? 'Sample' : 'Hidden'} Test Case #{result.order_index + 1}
            </span>
            <span
              className={`text-sm px-2.5 py-1 rounded font-medium ${
                result.passed
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {result.passed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>

          {/* Show error if test failed */}
          {!result.passed && result.error && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-text">{result.error}</p>
            </div>
          )}

          {/* Show debug output (stderr) if available */}
          {result.debug_output && result.debug_output.trim() && (
            <details className="mt-3">
              <summary className="text-sm text-text cursor-pointer hover:text-primary flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                View validator debug output (stderr)
              </summary>
              <pre className="mt-3 p-3 bg-background rounded text-sm text-text-muted overflow-x-auto border border-border font-mono">
                {result.debug_output}
              </pre>
            </details>
          )}

          {/* Show input/expected preview (collapsed by default) */}
          <details className="mt-3">
            <summary className="text-sm text-text cursor-pointer hover:text-primary font-medium">
              View test case input/output
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <span className="text-sm font-semibold text-text block mb-2">
                  Input:
                </span>
                <pre className="p-3 bg-background rounded text-sm text-text overflow-x-auto border border-border font-mono">
                  {result.input}
                </pre>
              </div>
              <div>
                <span className="text-sm font-semibold text-text block mb-2">
                  Expected Output:
                </span>
                <pre className="p-3 bg-background rounded text-sm text-text overflow-x-auto border border-border font-mono">
                  {result.expected}
                </pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div
        className={`flex items-start gap-4 p-5 rounded-lg border-2 ${
          valid
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}
      >
        {valid ? (
          <CheckCircle2 className="h-7 w-7 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-7 w-7 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-lg font-bold">
            {valid ? '✓ Validator Passed!' : '✗ Validator Failed'}
          </p>
          {message && <p className="text-base mt-2 opacity-90 font-medium">{message}</p>}
        </div>
      </div>

      {/* Sample Test Cases */}
      {sampleResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-bold text-text flex items-center gap-2">
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded text-sm">
              {sampleResults.length}
            </span>
            Sample Test Cases (Visible to Users)
          </h4>
          <div className="space-y-3">
            {sampleResults.map((result, index) => renderTestCase(result, index))}
          </div>
        </div>
      )}

      {/* Hidden Test Cases */}
      {hiddenResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-bold text-text flex items-center gap-2">
            <span className="px-2.5 py-1 bg-text-muted/20 text-text-muted rounded text-sm">
              {hiddenResults.length}
            </span>
            Hidden Test Cases (Edge Cases)
          </h4>
          <div className="space-y-3">
            {hiddenResults.map((result, index) => renderTestCase(result, index))}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="flex items-start gap-3 p-4 bg-background border-2 border-border rounded-lg">
        <AlertCircle className="h-5 w-5 text-text-muted flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-muted leading-relaxed">
          <strong>How Validation Works:</strong> The validator is tested by running{' '}
          <code className="px-1.5 py-0.5 bg-card rounded font-mono text-text">
            validator(input, expected, expected)
          </code>{' '}
          for each test case. It should return{' '}
          <code className="px-1.5 py-0.5 bg-card rounded font-mono text-text">
            {JSON.stringify({ passed: true })}
          </code>{' '}
          when the actual output matches the expected output. Testing against ALL test cases (including hidden ones) ensures your validator handles edge cases correctly.
        </p>
      </div>
    </div>
  );
}
