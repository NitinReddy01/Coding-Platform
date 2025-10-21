/**
 * Minimal problem data for list view (problems table)
 * This is the lean type used in Redux for displaying problems in a list/table.
 * For full problem details, fetch individually using the Problem API.
 */
export interface ProblemListItem {
  /** Unique identifier */
  id: string;
  /** Problem title */
  title: string;
  /** Difficulty level */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Acceptance rate percentage (0-100) */
  acceptance_rate: number;
  /** Total number of submissions */
  submissions: number;
  /** Number of accepted submissions */
  accepted: number;
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

/**
 * Backend API response types (matching Go backend)
 */

/**
 * Minimal problem data returned by backend API for list view
 */
export interface ProblemListItemApi {
  /** Unique identifier */
  id: string;
  /** Problem title */
  title: string;
  /** Difficulty level */
  difficulty: string;
  /** Number of accepted submissions */
  acceptance: number;
  /** Total number of submissions */
  submissions: number;
  /** Acceptance percentage (0-100) */
  acceptance_percentage: number;
}

/**
 * Backend paginated response structure
 */
export interface PaginatedProblemsResponse {
  /** List of problems */
  problems: ProblemListItemApi[];
  /** Total count of problems */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
}
