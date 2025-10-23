import { useState, useCallback } from 'react';
import { runCode, submitCode } from '../api/submissions';
import { useAxiosPrivate } from './useAxiosPrivate';
import { getErrorMessage } from '../utils/errorHandler';
import type { ExecutionResult } from '../types';

/**
 * Hook for code execution and submission
 *
 * @returns Object containing results, loading states, error, and execution functions
 *
 * @example
 * ```typescript
 * function EditorPanel() {
 *   const { submissionId, isRunning, runCode, submitCode } = useSubmission();
 *
 *   const handleRun = () => {
 *     runCode(code, language, problemId);
 *   };
 *
 *   return <button onClick={handleRun} disabled={isRunning}>Run</button>;
 * }
 * ```
 */
export const useSubmission = () => {
  const axiosPrivate = useAxiosPrivate();
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunCode = useCallback(async (code: string, language: string, problemId: string) => {
    setIsRunning(true);
    setError(null);
    setResults([]);
    setSubmissionId(null);

    try {
      const response = await runCode(axiosPrivate, code, language, problemId);
      setSubmissionId(response.submission_id);
      console.log('Run submission created:', response.submission_id);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to run code');
      setError(message);
    } finally {
      setIsRunning(false);
    }
  }, [axiosPrivate]);

  const handleSubmitCode = useCallback(async (code: string, language: string, problemId: string) => {
    setIsSubmitting(true);
    setError(null);
    setResults([]);
    setSubmissionId(null);

    try {
      const response = await submitCode(axiosPrivate, code, language, problemId);
      setSubmissionId(response.submission_id);
      console.log('Submit submission created:', response.submission_id);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to submit code');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [axiosPrivate]);

  return {
    results,
    submissionId,
    isRunning,
    isSubmitting,
    error,
    runCode: handleRunCode,
    submitCode: handleSubmitCode,
  };
};
