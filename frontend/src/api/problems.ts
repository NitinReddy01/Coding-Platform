/**
 * API endpoints for problem-related operations
 *
 * These functions require an authenticated axios instance.
 * Use with the useAxiosPrivate hook for automatic token handling.
 *
 * @module api/problems
 */

import type { AxiosInstance } from 'axios';
import type { Language, Problem, ProblemMode, TestCase } from '../types';
import type { PaginatedProblemsResponse } from '../types/problemList';
import type { ProblemInput } from '../types/problem-form';

/**
 * Validator test result for a single test case
 */
export interface ValidatorTestResult {
  test_case_id: string;
  input: string;
  expected: string;
  passed: boolean;
  error?: string;
  debug_output?: string; // stderr from validator for debugging
  is_sample: boolean; // whether this is a sample test case (visible to users)
  order_index: number;
}

/**
 * Response from validator testing endpoint
 */
export interface ValidateValidatorResponse {
  valid: boolean;
  results: ValidatorTestResult[];
  message?: string;
}

/**
 * Fetches a single problem by its ID
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param id - Unique identifier of the problem
 * @returns Promise resolving to the Problem object
 * @throws Error if the problem is not found or network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const problem = await fetchProblem(axiosPrivate, '123');
 * console.log(problem.title); // "Two Sum"
 * ```
 */
export const fetchProblem = async (
  axiosInstance: AxiosInstance,
  id: string,
  mode:ProblemMode
): Promise<Problem> => {
  const response = await axiosInstance.get<{problem:Problem}>(`/problems/${id}?mode=${mode}`);
  return response.data.problem;
};

/**
 * Fetches a list of problems with optional filters
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param filters - Optional filtering criteria
 * @param filters.difficulty - Filter by difficulty level (easy, medium, hard)
 * @param filters.tags - Filter by tag IDs (e.g., ["array", "dp"])
 * @param filters.search - Search by title or description
 * @returns Promise resolving to an array of Problem objects
 * @throws Error if the network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 *
 * // Fetch all problems
 * const allProblems = await fetchProblems(axiosPrivate);
 *
 * // Fetch only easy problems with "array" tag
 * const easyArrayProblems = await fetchProblems(axiosPrivate, {
 *   difficulty: 'easy',
 *   tags: ['array']
 * });
 * ```
 */
export const fetchProblems = async (
  axiosInstance: AxiosInstance,
  filters?: {
    difficulty?: string;
    tags?: string[];
    search?: string;
  }
): Promise<Problem[]> => {
  const response = await axiosInstance.get<Problem[]>('/problems', {
    params: filters,
  });
  return response.data;
};

export const fetchLanguages = async (axios:AxiosInstance,): Promise<Language[]> =>  {
  const response = await axios.get<Language[]>('/problems/languages');
  return response.data;
}

/**
 * Fetches a paginated list of problems
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param page - Page number (1-indexed, defaults to 1)
 * @param limit - Number of items per page (defaults to 20)
 * @returns Promise resolving to paginated problems response
 * @throws Error if the network request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const response = await fetchProblemsList(axiosPrivate, 1, 20);
 * console.log(response.problems); // Array of problems
 * console.log(response.total); // Total count
 * ```
 */
export const fetchProblemsList = async (
  axiosInstance: AxiosInstance,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedProblemsResponse> => {
  const response = await axiosInstance.get<PaginatedProblemsResponse>('/problems', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Creates a new problem
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param problemData - Problem data including title, description, test cases, tags, etc.
 * @returns Promise that resolves when the problem is created
 * @throws Error if the creation fails or validation errors occur
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const problemData = {
 *   title: "Two Sum",
 *   description: "Find two numbers that add up to target",
 *   difficulty: "easy",
 *   author_id: userId,
 *   status: "pending",
 *   time_limit: 2000,
 *   memory_limit: 256,
 *   test_cases: [...],
 *   tags: ["array", "hash-table"],
 * };
 * await createProblem(axiosPrivate, problemData);
 * ```
 */
export const createProblem = async (
  axiosInstance: AxiosInstance,
  problemData: ProblemInput
): Promise<void> => {
  await axiosInstance.post('/problems', problemData);
};

/**
 * Tests a custom validator against sample test cases
 *
 * @param axiosInstance - Axios instance (use useAxiosPrivate hook)
 * @param validatorCode - Python validator code
 * @param validatorLanguage - Validator language (currently only "python" supported)
 * @param testCases - Array of test cases to validate against
 * @returns Promise resolving to validation results
 * @throws Error if the validation request fails
 *
 * @example
 * ```typescript
 * const axiosPrivate = useAxiosPrivate();
 * const result = await testValidator(
 *   axiosPrivate,
 *   validatorCode,
 *   'python',
 *   sampleTestCases
 * );
 * if (result.valid) {
 *   console.log('Validator passed all test cases');
 * } else {
 *   console.log('Validator failed:', result.message);
 *   result.results.forEach(r => {
 *     if (!r.passed) console.log(`Test case ${r.order_index}: ${r.error}`);
 *   });
 * }
 * ```
 */
export const testValidator = async (
  axiosInstance: AxiosInstance,
  validatorCode: string,
  validatorLanguage: string,
  testCases: TestCase[]
): Promise<ValidateValidatorResponse> => {
  const response = await axiosInstance.post<ValidateValidatorResponse>(
    '/problems/validate-validator',
    {
      validator_code: validatorCode,
      validator_language: validatorLanguage,
      test_cases: testCases,
    }
  );
  return response.data;
};
