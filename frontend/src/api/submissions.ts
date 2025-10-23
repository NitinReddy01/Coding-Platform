/**
 * API endpoints for code execution and submission
 *
 * These functions require an authenticated axios instance.
 * Use with the useAxiosPrivate hook for automatic token handling.
 *
 * @module api/submissions
 */

import type { AxiosInstance } from 'axios';
import type { Submission, SubmissionResponse } from '../types';

/**
 * Runs code against sample test cases (for testing/debugging)
 *
 * Submits code to the queue for execution against sample test cases.
 * Returns a submission ID for tracking. Results are processed asynchronously.
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param code - User code to execute
 * @param language - Programming language
 * @param problemId - Problem identifier
 * @returns Promise resolving to submission ID and timestamp
 * @throws Error if submission fails or network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const result = await runCode(axiosPrivate, code, 'python', 'two-sum');
 * console.log('Submission ID:', result.submission_id);
 * ```
 */
export const runCode = async (
  axiosInstance: AxiosInstance,
  code: string,
  language: string,
  problemId: string
): Promise<SubmissionResponse> => {
  const submission: Submission = {
    code,
    language,
    problem_id: problemId,
    type: 'run',
  };

  const response = await axiosInstance.post<SubmissionResponse>(
    '/submissions',
    submission
  );
  return response.data;
};

/**
 * Submits code for official evaluation against all test cases
 *
 * Submits code to the queue for execution against ALL test cases (including hidden ones).
 * Returns a submission ID for tracking. Results are processed asynchronously.
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param code - User code to execute
 * @param language - Programming language
 * @param problemId - Problem identifier
 * @returns Promise resolving to submission ID and timestamp
 * @throws Error if submission fails or network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const result = await submitCode(axiosPrivate, code, 'python', 'two-sum');
 * console.log('Submission ID:', result.submission_id);
 * ```
 */
export const submitCode = async (
  axiosInstance: AxiosInstance,
  code: string,
  language: string,
  problemId: string
): Promise<SubmissionResponse> => {
  const submission: Submission = {
    code,
    language,
    problem_id: problemId,
    type: 'submit',
  };

  const response = await axiosInstance.post<SubmissionResponse>(
    '/submissions',
    submission
  );
  return response.data;
};
