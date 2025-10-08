/**
 * API endpoints for problem-related operations
 *
 * @module api/problems
 */

import type { Problem } from '../types';
import { apiClient } from './client';

/**
 * Fetches a single problem by its ID
 *
 * @param id - Unique identifier of the problem
 * @returns Promise resolving to the Problem object
 * @throws Error if the problem is not found or network request fails
 *
 * @example
 * ```typescript
 * const problem = await fetchProblem('123');
 * console.log(problem.title); // "Two Sum"
 * ```
 */
export const fetchProblem = async (id: string): Promise<Problem> => {
  const response = await apiClient.get<Problem>(`/problems/${id}`);
  return response.data;
};

/**
 * Fetches a list of problems with optional filters
 *
 * @param filters - Optional filtering criteria
 * @param filters.difficulty - Filter by difficulty level (easy, medium, hard)
 * @param filters.tags - Filter by tag IDs (e.g., ["array", "dp"])
 * @param filters.search - Search by title or description
 * @returns Promise resolving to an array of Problem objects
 * @throws Error if the network request fails
 *
 * @example
 * ```typescript
 * // Fetch all problems
 * const allProblems = await fetchProblems();
 *
 * // Fetch only easy problems with "array" tag
 * const easyArrayProblems = await fetchProblems({
 *   difficulty: 'easy',
 *   tags: ['array']
 * });
 * ```
 */
export const fetchProblems = async (filters?: {
  difficulty?: string;
  tags?: string[];
  search?: string;
}): Promise<Problem[]> => {
  const response = await apiClient.get<Problem[]>('/problems', {
    params: filters,
  });
  return response.data;
};
