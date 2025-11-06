export interface ProblemListItem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  acceptance_rate: number;
  submissions: number;
  accepted: number;
}

export interface ProblemFilters {
  search: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  status: 'all' | 'solved' | 'attempted' | 'unsolved';
  tags: string[];
}

export type SortField = 'id' | 'title' | 'difficulty' | 'acceptance_rate' | 'submissions';
export type SortOrder = 'asc' | 'desc';

export interface ProblemSort {
  field: SortField;
  order: SortOrder;
}

export interface ProblemsListResponse {
  problems: ProblemListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProblemListItemApi {
  id: string;
  title: string;
  difficulty: string;
  acceptance: number;
  submissions: number;
  acceptance_percentage: number;
}

export interface PaginatedProblemsResponse {
  problems: ProblemListItemApi[];
  total: number;
  page: number;
  limit: number;
}
