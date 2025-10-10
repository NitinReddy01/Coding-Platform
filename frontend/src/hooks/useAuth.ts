/**
 * Authentication hook
 *
 * Provides convenient access to authentication state and operations.
 * Wraps Redux auth state and API calls with user-friendly interface.
 *
 * @module hooks/useAuth
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, type RootState } from '../store/store';
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setPersist as setPersistAction,
} from '../store/slices/authSlice';
import * as authAPI from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../types/auth';

/**
 * Authentication hook return type
 */
interface UseAuthReturn {
  /** Current user data (null if not authenticated) */
  user: RootState['auth']['user'];

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Loading state for auth operations */
  loading: boolean;

  /** Whether to persist login session (Remember Me) */
  persist: boolean;

  /**
   * Login with email and password
   * @param credentials - Email and password
   * @throws Error if login fails
   */
  login: (credentials: LoginRequest) => Promise<void>;

  /**
   * Register new user with email and password
   * @param data - Name, email, and password
   * @throws Error if registration fails
   */
  register: (data: RegisterRequest) => Promise<void>;

  /**
   * Logout user and clear auth state
   * @throws Error if logout fails on backend
   */
  logout: () => Promise<void>;

  /**
   * Set persist preference (Remember Me)
   * @param persist - Whether to persist login session
   */
  setPersist: (persist: boolean) => void;
}

/**
 * Custom hook for authentication operations
 *
 * Provides convenient access to auth state and operations with automatic
 * Redux state management, API calls, navigation, and error handling.
 *
 * @returns Authentication state and operations
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * // Login
 * try {
 *   await login({ email: 'user@example.com', password: 'password123' });
 *   // User is now logged in and redirected
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 *
 * // Logout
 * await logout();
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, persist } = useAppSelector(
    (state) => state.auth
  );

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(setLoading(true));

        const { user, accessToken } = await authAPI.login(credentials);

        // Update Redux with user and token
        dispatch(setCredentials({ user, accessToken }));

        // Navigate to problems page
        navigate('/problems/1');
      } catch (error) {
        dispatch(setLoading(false));
        throw error; // Re-throw to let component handle error display
      }
    },
    [dispatch, navigate]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        dispatch(setLoading(true));

        const { user, accessToken } = await authAPI.register(data);

        // Update Redux with user and token
        dispatch(setCredentials({ user, accessToken }));

        // Navigate to problems page
        navigate('/problems/1');
      } catch (error) {
        dispatch(setLoading(false));
        throw error; // Re-throw to let component handle error display
      }
    },
    [dispatch, navigate]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Call backend to invalidate refresh token
      await authAPI.logout();
    } catch (error) {
      // Log error but continue with local logout
      console.error('Logout API call failed:', error);
    } finally {
      // Clear Redux state regardless of API call result
      dispatch(logoutAction());

      // Navigate to login page
      navigate('/login');
    }
  }, [dispatch, navigate]);

  /**
   * Set persist preference
   */
  const setPersist = useCallback(
    (persist: boolean) => {
      dispatch(setPersistAction(persist));
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    loading,
    persist,
    login,
    register,
    logout,
    setPersist,
  };
};
