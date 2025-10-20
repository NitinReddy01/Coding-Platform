/**
 * Problems Redux slice
 *
 * Manages state for problems list, filters, pagination, and sorting.
 * Integrates with backend API for fetching problems.
 *
 * @module store/slices/problemsSlice
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosInstance } from 'axios';
import type {
  ProblemListItem,
  ProblemFilters,
  ProblemSort,
  ProblemListItemApi,
} from '../../types/problemList';
import { fetchProblemsList } from '../../api/problems';
import type { RootState } from '../store';

interface ProblemsState {
  // Problems list
  problems: ProblemListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;

  // Filters
  filters: ProblemFilters;

  // Sort
  sort: ProblemSort;

  // Loading state
  loading: boolean;
  error: string | null;

  // Current problem (for detail view)
  currentProblem: ProblemListItem | null;
}

const initialState: ProblemsState = {
  problems: [],
  total: 0,
  currentPage: 1,
  totalPages: 0,
  pageSize: 20,

  filters: {
    search: '',
    difficulty: 'all',
    status: 'all',
    tags: [],
  },

  sort: {
    field: 'id',
    order: 'asc',
  },

  loading: false,
  error: null,

  currentProblem: null,
};

/**
 * Async thunk to fetch problems from backend API
 * Automatically handles loading and error states
 *
 * @param axiosInstance - Authenticated axios instance from useAxiosPrivate hook
 */
export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async (axiosInstance: AxiosInstance, { getState }) => {
    const state = getState() as RootState;
    const { currentPage, pageSize } = state.problems;

    const response = await fetchProblemsList(axiosInstance, currentPage, pageSize);

    // Map backend response to simplified list format
    // Note: Only fields needed for table display, full details fetched per-problem on demand
    const mappedProblems: ProblemListItem[] = response.problems.map((p: ProblemListItemApi) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty as 'easy' | 'medium' | 'hard',
      acceptance_rate: Math.round(p.acceptance_percentage),
      submissions: p.submissions,
      accepted: p.acceptance,
    }));

    return {
      problems: mappedProblems,
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  }
);

const problemsSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {
    /**
     * Set search filter
     */
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    /**
     * Set difficulty filter
     */
    setDifficulty: (state, action: PayloadAction<'all' | 'easy' | 'medium' | 'hard'>) => {
      state.filters.difficulty = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set status filter
     */
    setStatus: (state, action: PayloadAction<'all' | 'solved' | 'attempted' | 'unsolved'>) => {
      state.filters.status = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set tags filter
     */
    setTags: (state, action: PayloadAction<string[]>) => {
      state.filters.tags = action.payload;
      state.currentPage = 1;
    },

    /**
     * Add a tag to filter
     */
    addTag: (state, action: PayloadAction<string>) => {
      if (!state.filters.tags.includes(action.payload)) {
        state.filters.tags.push(action.payload);
        state.currentPage = 1;
      }
    },

    /**
     * Remove a tag from filter
     */
    removeTag: (state, action: PayloadAction<string>) => {
      state.filters.tags = state.filters.tags.filter((tag) => tag !== action.payload);
      state.currentPage = 1;
    },

    /**
     * Clear all filters
     */
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },

    /**
     * Set sort field and order
     */
    setSort: (state, action: PayloadAction<ProblemSort>) => {
      state.sort = action.payload;
    },

    /**
     * Toggle sort order for a field
     */
    toggleSort: (state, action: PayloadAction<ProblemSort['field']>) => {
      if (state.sort.field === action.payload) {
        // Toggle order if same field
        state.sort.order = state.sort.order === 'asc' ? 'desc' : 'asc';
      } else {
        // Set new field with asc order
        state.sort.field = action.payload;
        state.sort.order = 'asc';
      }
    },

    /**
     * Set current page
     */
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    /**
     * Set page size
     */
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    /**
     * Set current problem for detail view
     */
    setCurrentProblem: (state, action: PayloadAction<ProblemListItem | null>) => {
      state.currentProblem = action.payload;
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload.problems;
        state.total = action.payload.total;
        state.totalPages = Math.ceil(action.payload.total / action.payload.limit);
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch problems';
      });
  },
});

export const {
  setSearch,
  setDifficulty,
  setStatus,
  setTags,
  addTag,
  removeTag,
  clearFilters,
  setSort,
  toggleSort,
  setPage,
  setPageSize,
  setCurrentProblem,
  setLoading,
  setError,
} = problemsSlice.actions;

export default problemsSlice.reducer;
