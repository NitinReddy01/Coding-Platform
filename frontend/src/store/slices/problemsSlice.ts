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

    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    setDifficulty: (state, action: PayloadAction<'all' | 'easy' | 'medium' | 'hard'>) => {
      state.filters.difficulty = action.payload;
      state.currentPage = 1;
    },

    setStatus: (state, action: PayloadAction<'all' | 'solved' | 'attempted' | 'unsolved'>) => {
      state.filters.status = action.payload;
      state.currentPage = 1;
    },

    setTags: (state, action: PayloadAction<string[]>) => {
      state.filters.tags = action.payload;
      state.currentPage = 1;
    },

    addTag: (state, action: PayloadAction<string>) => {
      if (!state.filters.tags.includes(action.payload)) {
        state.filters.tags.push(action.payload);
        state.currentPage = 1;
      }
    },

    removeTag: (state, action: PayloadAction<string>) => {
      state.filters.tags = state.filters.tags.filter((tag) => tag !== action.payload);
      state.currentPage = 1;
    },

    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },

    setSort: (state, action: PayloadAction<ProblemSort>) => {
      state.sort = action.payload;
    },

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

    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    setCurrentProblem: (state, action: PayloadAction<ProblemListItem | null>) => {
      state.currentProblem = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

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
