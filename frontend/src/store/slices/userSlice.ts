import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  mockUserProfile,
  mockUserStats,
  mockLanguageUsage,
  mockSolvedProblems,
  mockSubmissionCalendar,
  type UserProfile,
  type UserStats,
  type LanguageUsage,
  type SolvedProblem,
  type SubmissionCalendarDay,
} from '../../constants/mockUserData';

export interface UserState {
  profile: UserProfile | null;
  stats: UserStats | null;
  languageUsage: LanguageUsage[];
  solvedProblems: SolvedProblem[];
  submissionCalendar: SubmissionCalendarDay[];
  loading: boolean;
  error: string | null;
  activeTab: 'solved' | 'activity';
}

const initialState: UserState = {
  profile: null,
  stats: null,
  languageUsage: [],
  solvedProblems: [],
  submissionCalendar: [],
  loading: false,
  error: null,
  activeTab: 'solved',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUserProfile: (state, action: PayloadAction<string | undefined>) => {
      state.loading = true;
      state.error = null;

      // Set mock data synchronously
      // In real app, this would be an async thunk with API call
      state.profile = mockUserProfile;
      state.stats = mockUserStats;
      state.languageUsage = mockLanguageUsage;
      state.solvedProblems = mockSolvedProblems;
      state.submissionCalendar = mockSubmissionCalendar;
      state.loading = false;
    },

    setActiveTab: (state, action: PayloadAction<'solved' | 'activity'>) => {
      state.activeTab = action.payload;
    },

    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    clearUserData: (state) => {
      state.profile = null;
      state.stats = null;
      state.languageUsage = [];
      state.solvedProblems = [];
      state.submissionCalendar = [];
      state.error = null;
    },
  },
});

export const {
  fetchUserProfile,
  setActiveTab,
  updateProfile,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;
