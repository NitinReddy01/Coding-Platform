/**
 * API endpoints for code execution and submission
 *
 * These functions require an authenticated axios instance.
 * Use with the useAxiosPrivate hook for automatic token handling.
 *
 * @module api/submissions
 */

import type { AxiosInstance } from 'axios';
import type { Submission, SubmissionResponse, SubmissionStatusResponse, LatestSubmissionResponse } from '../types';

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

/**
 * Gets the current status of a submission (for polling)
 *
 * Polls the backend to check if the submission has completed processing.
 * Returns lightweight status information without heavy data like code or detailed results.
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param submissionId - Submission identifier to check
 * @returns Promise resolving to submission status and metrics
 * @throws Error if submission not found or network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const status = await getSubmissionStatus(axiosPrivate, submissionId);
 * if (status.status === 'accepted') {
 *   console.log('All tests passed!');
 * }
 * ```
 */
export const getSubmissionStatus = async (
  axiosInstance: AxiosInstance,
  submissionId: string
): Promise<SubmissionStatusResponse> => {
  const response = await axiosInstance.get<SubmissionStatusResponse>(
    `/submissions/status/${submissionId}`
  );
  return response.data;
};

/**
 * Gets the user's latest submission for a problem
 *
 * Fetches the most recent submission (code and language) for a specific problem.
 * Used to populate the code editor when the user revisits a problem.
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param problemId - Problem identifier
 * @returns Promise resolving to the latest submission data
 * @throws Error if no submission found or network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * try {
 *   const latest = await getLatestSubmission(axiosPrivate, problemId);
 *   // Populate editor with latest.code and latest.language
 * } catch (err) {
 *   // No previous submission, use default template
 * }
 * ```
 */
export const getLatestSubmission = async (
  axiosInstance: AxiosInstance,
  problemId: string
): Promise<LatestSubmissionResponse> => {
  const response = await axiosInstance.get<LatestSubmissionResponse>(
    `/submissions/problem/${problemId}/latest`
  );
  return response.data;
};
