/**
 * Custom hook for handling code execution and submission
 *
 * Manages execution state (running/submitting) and results locally.
 *
 * @module hooks/useSubmission
 */

import { useState, useCallback } from 'react';
import { runCode, submitCode } from '../api/submissions';
import { useAxiosPrivate } from './useAxiosPrivate';
import type { Submission, ExecutionResult } from '../types';

/**
 * Hook for code execution and submission
 *
 * @param useMock - Whether to use mock execution instead of API (default: true)
 * @returns Object containing results, loading states, error, and execution functions
 *
 * @example
 * ```typescript
 * function EditorPanel() {
 *   const { results, isRunning, runCode, submitCode } = useSubmission(false);
 *
 *   const handleRun = () => {
 *     runCode({ code, language, test_cases, time_limit, memory_limit });
 *   };
 *
 *   return <button onClick={handleRun} disabled={isRunning}>Run</button>;
 * }
 * ```
 */
export const useSubmission = (useMock = true) => {
  const axiosPrivate = useAxiosPrivate();
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runs code against sample test cases
   */
  const handleRunCode = useCallback(async (submission: Submission) => {
    setIsRunning(true);
    setError(null);

    try {
      if (useMock) {
        // Simulate code execution
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockResults: ExecutionResult[] = submission.test_cases.map(
          (testCase, index) => ({
            test_case_index: index,
            passed: Math.random() > 0.3, // 70% pass rate for demo
            input: testCase.input,
            output: testCase.expected_output, // In real scenario, this would be actual output
            expected_output: testCase.expected_output,
            execution_time: Math.floor(Math.random() * 100) + 10,
            memory_used: Math.floor(Math.random() * 20) + 5,
          })
        );

        setResults(mockResults);
      } else {
        const response = await runCode(axiosPrivate, submission);
        setResults(response.results);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run code';
      setError(message);
    } finally {
      setIsRunning(false);
    }
  }, [useMock, axiosPrivate]);

  /**
   * Submits code for official evaluation
   */
  const handleSubmitCode = useCallback(async (submission: Submission) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (useMock) {
        // Simulate submission
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockResults: ExecutionResult[] = submission.test_cases.map(
          (testCase, index) => ({
            test_case_index: index,
            passed: Math.random() > 0.2, // 80% pass rate for demo
            input: testCase.input,
            output: testCase.expected_output,
            expected_output: testCase.expected_output,
            execution_time: Math.floor(Math.random() * 150) + 20,
            memory_used: Math.floor(Math.random() * 30) + 10,
          })
        );

        setResults(mockResults);
      } else {
        const response = await submitCode(axiosPrivate, submission);
        setResults(response.results);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit code';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [useMock, axiosPrivate]);

  return {
    /** Array of test case execution results */
    results,
    /** Whether code is currently running (sample tests) */
    isRunning,
    /** Whether code is currently being submitted (all tests) */
    isSubmitting,
    /** Error message if execution failed, null otherwise */
    error,
    /** Function to run code against sample test cases */
    runCode: handleRunCode,
    /** Function to submit code for official evaluation */
    submitCode: handleSubmitCode,
  };
};
