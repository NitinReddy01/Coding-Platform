import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import { mockSubmissionsData, type SubmissionDetail } from '../../constants/mockSubmissionsData';

export interface SubmissionsFilters {
  status: 'all' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compilation_error';
  language: 'all' | string;
  problem: string; // Search by problem title
  dateFrom: string | null;
  dateTo: string | null;
}

export interface SubmissionsSort {
  field: 'submitted_at' | 'problem_title' | 'status' | 'language';
  order: 'asc' | 'desc';
}

export interface SubmissionsState {
  submissions: SubmissionDetail[];
  allSubmissions: SubmissionDetail[];
  filters: SubmissionsFilters;
  sort: SubmissionsSort;
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading: boolean;
  selectedSubmission: SubmissionDetail | null;
  isModalOpen: boolean;
}

const initialState: SubmissionsState = {
  submissions: [],
  allSubmissions: mockSubmissionsData,
  filters: {
    status: 'all',
    language: 'all',
    problem: '',
    dateFrom: null,
    dateTo: null,
  },
  sort: {
    field: 'submitted_at',
    order: 'desc',
  },
  currentPage: 1,
  pageSize: 15,
  total: 0,
  totalPages: 0,
  loading: false,
  selectedSubmission: null,
  isModalOpen: false,
};

/**
 * Filter submissions based on current filters
 */
function filterSubmissions(submissions: SubmissionDetail[], filters: SubmissionsFilters): SubmissionDetail[] {
  return submissions.filter((submission) => {
    // Status filter
    if (filters.status !== 'all' && submission.status !== filters.status) {
      return false;
    }

    // Language filter
    if (filters.language !== 'all' && submission.language !== filters.language) {
      return false;
    }

    // Problem search filter
    if (filters.problem && !submission.problem_title.toLowerCase().includes(filters.problem.toLowerCase())) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (submission.submitted_at < from) {
        return false;
      }
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999); // End of day
      if (submission.submitted_at > to) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort submissions based on current sort settings
 */
function sortSubmissions(submissions: SubmissionDetail[], sort: SubmissionsSort): SubmissionDetail[] {
  const sorted = [...submissions];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'submitted_at':
        comparison = a.submitted_at.getTime() - b.submitted_at.getTime();
        break;
      case 'problem_title':
        comparison = a.problem_title.localeCompare(b.problem_title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'language':
        comparison = a.language.localeCompare(b.language);
        break;
    }

    return sort.order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Paginate submissions
 */
function paginateSubmissions(submissions: SubmissionDetail[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return submissions.slice(start, end);
}

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    fetchSubmissions: (state) => {
      state.loading = true;

      // Apply filters
      let filtered = filterSubmissions(state.allSubmissions, state.filters);

      // Apply sorting
      filtered = sortSubmissions(filtered, state.sort);

      // Calculate pagination
      state.total = filtered.length;
      state.totalPages = Math.ceil(filtered.length / state.pageSize);

      // Ensure current page is valid
      if (state.currentPage > state.totalPages && state.totalPages > 0) {
        state.currentPage = state.totalPages;
      }

      // Apply pagination
      state.submissions = paginateSubmissions(filtered, state.currentPage, state.pageSize);

      state.loading = false;
    },

    setStatusFilter: (state, action: PayloadAction<SubmissionsFilters['status']>) => {
      state.filters.status = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    setLanguageFilter: (state, action: PayloadAction<string>) => {
      state.filters.language = action.payload;
      state.currentPage = 1;
    },

    setProblemFilter: (state, action: PayloadAction<string>) => {
      state.filters.problem = action.payload;
      state.currentPage = 1;
    },

    setDateRange: (state, action: PayloadAction<{ dateFrom: string | null; dateTo: string | null }>) => {
      state.filters.dateFrom = action.payload.dateFrom;
      state.filters.dateTo = action.payload.dateTo;
      state.currentPage = 1;
    },

    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },

    setSort: (state, action: PayloadAction<SubmissionsSort>) => {
      state.sort = action.payload;
    },

    toggleSort: (state, action: PayloadAction<SubmissionsSort['field']>) => {
      if (state.sort.field === action.payload) {
        state.sort.order = state.sort.order === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort.field = action.payload;
        state.sort.order = 'desc';
      }
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    openModal: (state, action: PayloadAction<SubmissionDetail>) => {
      state.selectedSubmission = action.payload;
      state.isModalOpen = true;
    },

    closeModal: (state) => {
      state.isModalOpen = false;
      // Don't clear selectedSubmission immediately to allow fade-out animation
      setTimeout(() => {
        state.selectedSubmission = null;
      }, 300);
    },
  },
});

export const {
  fetchSubmissions,
  setStatusFilter,
  setLanguageFilter,
  setProblemFilter,
  setDateRange,
  clearFilters,
  setSort,
  toggleSort,
  setPage,
  setPageSize,
  openModal,
  closeModal,
} = submissionsSlice.actions;

export default submissionsSlice.reducer;
