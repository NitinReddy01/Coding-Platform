import { useState, useEffect, useCallback, useRef } from 'react';
import { getSubmissionStatus } from '../api/submissions';
import { apiClient } from '../api/axios';
import { getErrorMessage } from '../utils/errorHandler';
import type { SubmissionStatus, SubmissionStatusResponse } from '../types';

const POLL_INTERVAL_MS = 800;
const PROCESSING_STATUSES: SubmissionStatus[] = ['pending', 'running'];

export const useSubmissionPolling = (submissionId: string | null) => {
  const [statusData, setStatusData] = useState<SubmissionStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!submissionId) return;

    try {
      const data = await getSubmissionStatus(apiClient, submissionId);
      setStatusData(data);
      setError(null);

      // Stop polling if submission reached final status
      if (!PROCESSING_STATUSES.includes(data.status)) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch submission status');
      setError(message);
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [submissionId]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!submissionId) {
      setIsPolling(false);
      setStatusData(null);
      setError(null);
      return;
    }

    setIsPolling(true);
    fetchStatus();

    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [submissionId, fetchStatus]);

  return {
    status: statusData?.status ?? null,
    runtimeMs: statusData?.runtime_ms ?? null,
    memoryUsedMb: statusData?.memory_used_mb ?? null,
    testCasesPassed: statusData?.test_cases_passed ?? null,
    testCasesTotal: statusData?.test_cases_total ?? null,
    errorMessage: statusData?.error_message ?? null,
    sampleTestResults: statusData?.sample_test_results ?? null,
    isPolling,
    error,
  };
};
