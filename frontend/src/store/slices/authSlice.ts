/**
 * Authentication Redux slice
 *
 * Manages authentication state for the application. Stores user profile data
 * (including roles from backend) in Redux for fast synchronous access.
 * Session persistence is handled by Supabase internally.
 *
 * @module store/slices/authSlice
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types/auth';

/**
 * Initial authentication state
 *
 * User data is null on initial load. PersistLogin component validates
 * the Supabase session and syncs user data from backend on app mount.
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

/**
 * Authentication slice
 *
 * Handles auth-related state mutations. Session persistence is managed
 * by Supabase, Redux only stores runtime state for fast access.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user credentials after successful login or session restore
     *
     * @param payload.user - User profile data with roles from backend
     */
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
    },

    /**
     * Clear authentication state on logout
     *
     * Clears Redux state. Supabase session is cleared separately
     * via supabase.auth.signOut() in useAuth hook.
     */
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    /**
     * Set loading state for auth operations
     *
     * @param payload - Loading state (true/false)
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
} = authSlice.actions;
export default authSlice.reducer;
