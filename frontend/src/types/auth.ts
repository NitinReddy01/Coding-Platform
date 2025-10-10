/**
 * Authentication type definitions
 *
 * Defines types for user data, authentication requests/responses,
 * and auth state management.
 *
 * @module types/auth
 */

/**
 * User profile data
 *
 * Core user information stored in Redux and localStorage
 */
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Authentication response from login/register/Google OAuth
 *
 * Contains user data and access token (refresh token is in HttpOnly cookie)
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
}

/**
 * Token refresh response
 *
 * Returns only new access token (refresh token remains in cookie)
 */
export interface RefreshResponse {
  accessToken: string;
}

/**
 * Auth state shape in Redux
 */
export interface AuthState {
  /**
   * JWT access token (short-lived, ~15 min)
   * Stored in Redux only, cleared on page refresh by design
   */
  accessToken: string | null;

  /**
   * Current user data
   * Persisted to localStorage for session restoration
   */
  user: User | null;

  /**
   * Whether user is authenticated
   * Derived from presence of accessToken and user
   */
  isAuthenticated: boolean;

  /**
   * Loading state for auth operations
   */
  loading: boolean;

  /**
   * Whether to persist login session (Remember Me)
   * When true, attempts to refresh access token on app mount
   * Persisted to localStorage
   */
  persist: boolean;
}
