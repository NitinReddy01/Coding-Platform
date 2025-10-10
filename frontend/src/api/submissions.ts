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
 * Executes user code in a sandboxed Docker environment with the
 * sample test cases. Results are returned immediately without
 * being saved to the database.
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param submission - Code submission with language, code, and test cases
 * @returns Promise resolving to execution results for all test cases
 * @throws Error if execution fails or network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const submission = {
 *   code: 'print(input())',
 *   language: 'python',
 *   test_cases: [{ input: 'hello', expected_output: 'hello' }],
 *   time_limit: 2000,
 *   memory_limit: 128
 * };
 *
 * const result = await runCode(axiosPrivate, submission);
 * console.log(result.passed_tests, '/', result.total_tests);
 * ```
 */
export const runCode = async (
  axiosInstance: AxiosInstance,
  submission: Submission
): Promise<SubmissionResponse> => {
  const response = await axiosInstance.post<SubmissionResponse>(
    '/submissions/run',
    submission
  );
  return response.data;
};

/**
 * Submits code for official evaluation against all test cases
 *
 * Executes user code against ALL test cases (including hidden ones)
 * and saves the submission to the database. Used for final submission
 * to determine if the problem is solved correctly.
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param submission - Code submission with language, code, and test cases
 * @returns Promise resolving to execution results and statistics
 * @throws Error if execution fails or network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const submission = {
 *   code: 'def solution(): pass',
 *   language: 'python',
 *   test_cases: problem.sample_test_cases,
 *   time_limit: problem.time_limit,
 *   memory_limit: problem.memory_limit
 * };
 *
 * const result = await submitCode(axiosPrivate, submission);
 * if (result.passed_tests === result.total_tests) {
 *   console.log('Accepted!');
 * }
 * ```
 */
export const submitCode = async (
  axiosInstance: AxiosInstance,
  submission: Submission
): Promise<SubmissionResponse> => {
  const response = await axiosInstance.post<SubmissionResponse>(
    '/submissions/submit',
    submission
  );
  return response.data;
};
