/**
 * Authentication Redux slice
 *
 * Manages global authentication state including access token, user data,
 * and authentication status. Integrates with localStorage for session
 * persistence across page refreshes.
 *
 * @module store/slices/authSlice
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types/auth';

/**
 * localStorage key for user data persistence
 */
const USER_STORAGE_KEY = 'user';

/**
 * localStorage key for persist preference
 */
const PERSIST_STORAGE_KEY = 'persist';

/**
 * Load user from localStorage on app initialization
 */
const loadUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to load user from localStorage:', error);
    return null;
  }
};

/**
 * Save user to localStorage
 */
const saveUserToStorage = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to save user to localStorage:', error);
  }
};

/**
 * Load persist preference from localStorage
 */
const loadPersistFromStorage = (): boolean => {
  try {
    const storedPersist = localStorage.getItem(PERSIST_STORAGE_KEY);
    return storedPersist === 'true';
  } catch (error) {
    console.error('Failed to load persist from localStorage:', error);
    return false;
  }
};

/**
 * Save persist preference to localStorage
 */
const savePersistToStorage = (persist: boolean): void => {
  try {
    localStorage.setItem(PERSIST_STORAGE_KEY, String(persist));
  } catch (error) {
    console.error('Failed to save persist to localStorage:', error);
  }
};

/**
 * Initial authentication state
 *
 * Attempts to restore user from localStorage on app load.
 * Access token is intentionally NOT persisted for security.
 */
const initialState: AuthState = {
  accessToken: null,
  user: loadUserFromStorage(),
  isAuthenticated: false,
  loading: false,
  persist: loadPersistFromStorage(),
};

/**
 * Authentication slice
 *
 * Handles all auth-related state mutations with automatic localStorage sync.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user credentials after successful login/register/OAuth
     *
     * Stores access token in Redux and user data in both Redux and localStorage.
     * Sets isAuthenticated to true.
     *
     * @param payload.user - User profile data
     * @param payload.accessToken - JWT access token
     */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      saveUserToStorage(action.payload.user);
    },

    /**
     * Update access token after successful refresh
     *
     * Used by token refresh interceptor when access token expires.
     * Only updates token, user data remains unchanged.
     *
     * @param payload - New JWT access token
     */
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },

    /**
     * Clear authentication state on logout
     *
     * Removes all auth data from Redux and localStorage.
     * Sets isAuthenticated to false.
     */
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      saveUserToStorage(null);
    },

    /**
     * Set loading state for auth operations
     *
     * Used to show loading indicators during login/register/refresh.
     *
     * @param payload - Loading state (true/false)
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set persist preference (Remember Me)
     *
     * Enables/disables automatic token refresh on app mount.
     * Persisted to localStorage.
     *
     * @param payload - Persist preference (true/false)
     */
    setPersist: (state, action: PayloadAction<boolean>) => {
      state.persist = action.payload;
      savePersistToStorage(action.payload);
    },
  },
});

export const { setCredentials, setAccessToken, logout, setLoading, setPersist } =
  authSlice.actions;
export default authSlice.reducer;
