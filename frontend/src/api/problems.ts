/**
 * API endpoints for problem-related operations
 *
 * These functions require an authenticated axios instance.
 * Use with the useAxiosPrivate hook for automatic token handling.
 *
 * @module api/problems
 */

import type { AxiosInstance } from 'axios';
import type { Language, Problem, ProblemMode } from '../types';

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
