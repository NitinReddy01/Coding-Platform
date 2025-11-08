import { useEffect, useState } from 'react';
import { fetchProblem } from '../api/problems';
import { apiClient } from '../api/axios';
import { getErrorMessage } from '../utils/errorHandler';
import type { Problem, ProblemMode } from '../types';

export const useProblem = (problemId: string,mode:ProblemMode) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProblem = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
        const data = await fetchProblem(apiClient, id,mode);
        setProblem(data);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load problem');
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
    problem,
    loading,
    error,
    refetch: () => loadProblem(problemId),
  };
};
