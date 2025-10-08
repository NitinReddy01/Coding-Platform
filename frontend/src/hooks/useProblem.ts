/**
 * Custom hook for fetching and managing problem data
 *
 * Automatically fetches a problem when the component mounts or when
 * the problemId changes. Manages loading and error states locally.
 *
 * @module hooks/useProblem
 */

import { useEffect, useState } from 'react';
import { fetchProblem } from '../api/problems';
import { mockProblem } from '../constants/mockData';
import type { Problem } from '../types';

/**
 * Hook for fetching and accessing problem data
 *
 * @param problemId - Unique identifier of the problem to fetch
 * @param useMock - Whether to use mock data instead of API (default: true)
 * @returns Object containing problem data, loading state, error, and refetch function
 *
 * @example
 * ```typescript
 * function ProblemPage() {
 *   const { problem, loading, error, refetch } = useProblem('123', false);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!problem) return <div>Problem not found</div>;
 *
 *   return <div>{problem.title}</div>;
 * }
 * ```
 */
export const useProblem = (problemId: string, useMock = true) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads problem data from API or mock
   *
   * @param id - Problem ID to fetch
   */
  const loadProblem = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      if (useMock) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProblem(mockProblem);
      } else {
        const data = await fetchProblem(id);
        setProblem(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load problem';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch problem when component mounts or problemId changes
  useEffect(() => {
    if (problemId) {
      loadProblem(problemId);
    }
  }, [problemId]);

  return {
    /** The fetched problem data, null if not loaded */
    problem,
    /** Whether the problem is currently being fetched */
    loading,
    /** Error message if fetching failed, null otherwise */
    error,
    /** Function to manually refetch the problem */
    refetch: () => loadProblem(problemId),
  };
};
