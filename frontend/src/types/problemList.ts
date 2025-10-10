import type { Problem } from './problem';

/**
 * User's solve status for a problem
 */
export type SolveStatus = 'solved' | 'attempted' | 'unsolved';

/**
 * Extended problem interface for list view
 * Includes user-specific solve status and acceptance rate
 */
export interface ProblemListItem extends Problem {
  /** User's solve status for this problem */
  solve_status: SolveStatus;
  /** Acceptance rate percentage (0-100) */
  acceptance_rate: number;
}

/**
 * Filter options for problems list
 */
export interface ProblemFilters {
  search: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  status: 'all' | 'solved' | 'attempted' | 'unsolved';
  tags: string[];
}

/**
 * Sort options for problems list
 */
export type SortField = 'id' | 'title' | 'difficulty' | 'acceptance_rate' | 'submissions';
export type SortOrder = 'asc' | 'desc';

export interface ProblemSort {
  field: SortField;
  order: SortOrder;
}

/**
 * Paginated problems list response
 */
export interface ProblemsListResponse {
  problems: ProblemListItem[];
  total: number;
  page: number;
  totalPages: number;
}
