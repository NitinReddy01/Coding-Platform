import { useState, useCallback, useEffect } from 'react';
import { runCode, submitCode } from '../api/submissions';
import { apiClient } from '../api/axios';
import { useSubmissionPolling } from './useSubmissionPolling';
import { getErrorMessage } from '../utils/errorHandler';
import type { ExecutionResult, SubmissionType } from '../types';

export const useSubmission = () => {
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null);
  const [lastSubmissionType, setLastSubmissionType] = useState<'run' | 'submit' | null>(null);

  const {
    status,
    runtimeMs,
    memoryUsedMb,
    testCasesPassed,
    testCasesTotal,
    errorMessage,
    sampleTestResults,
    isPolling,
    error: pollingError,
  } = useSubmissionPolling(submissionId);

  // Keep buttons disabled while polling is active
  // Turn off loading states when polling completes
  useEffect(() => {
    if (!isPolling && (isRunning || isSubmitting)) {
      // Polling finished, re-enable buttons
      if (lastSubmissionType === 'run') {
        setIsRunning(false);
      } else if (lastSubmissionType === 'submit') {
        setIsSubmitting(false);
      }
      setLastSubmissionType(null);
    }
  }, [isPolling, isRunning, isSubmitting, lastSubmissionType]);

  const handleRunCode = useCallback(async (code: string, language: string, problemId: string) => {
    setIsRunning(true);
    setLastSubmissionType('run');
    setSubmissionType('run');
    setError(null);
    setResults([]);
    setSubmissionId(null);

    try {
      const response = await runCode(apiClient, code, language, problemId);
      setSubmissionId(response.submission_id);
      // Note: isRunning will be set to false by useEffect when polling completes
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to run code');
      setError(message);
      setIsRunning(false); // Only disable on error
      setLastSubmissionType(null);
      setSubmissionType(null);
    }
  }, []);

  const handleSubmitCode = useCallback(async (code: string, language: string, problemId: string) => {
    setIsSubmitting(true);
    setLastSubmissionType('submit');
    setSubmissionType('submit');
    setError(null);
    setResults([]);
    setSubmissionId(null);

    try {
      const response = await submitCode(apiClient, code, language, problemId);
      setSubmissionId(response.submission_id);
      // Note: isSubmitting will be set to false by useEffect when polling completes
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to submit code');
      setError(message);
      setIsSubmitting(false); // Only disable on error
      setLastSubmissionType(null);
      setSubmissionType(null);
    }
  }, []);

  return {
    results,
    submissionId,
    isRunning,
    isSubmitting,
    error: error || pollingError, // Combine submission and polling errors
    submissionType,
    // Polling status data
    status,
    runtimeMs,
    memoryUsedMb,
    testCasesPassed,
    testCasesTotal,
    errorMessage,
    sampleTestResults,
    isPolling,
    // Actions
    runCode: handleRunCode,
    submitCode: handleSubmitCode,
  };
};
