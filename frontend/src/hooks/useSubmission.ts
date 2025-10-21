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
import { getErrorMessage } from '../utils/errorHandler';
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
export const useSubmission = () => {
  const axiosPrivate = useAxiosPrivate();
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunCode = useCallback(async (submission: Submission) => {
    setIsRunning(true);
    setError(null);

    try {
      // const response = await runCode(axiosPrivate, submission);
      // setResults(response.results);
      console.log(submission);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to run code');
      setError(message);
    } finally {
      setIsRunning(false);
    }
  }, [axiosPrivate]);

  const handleSubmitCode = useCallback(async (submission: Submission) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log(submission);
      // const response = await submitCode(axiosPrivate, submission);
      // setResults(response.results);

    } catch (err) {
      const message = getErrorMessage(err, 'Failed to submit code');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [axiosPrivate]);

  return {
    results,
    isRunning,
    isSubmitting,
    error,
    runCode: handleRunCode,
    submitCode: handleSubmitCode,
  };
};
