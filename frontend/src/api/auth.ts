/**
 * Authentication API endpoints
 *
 * Handles all authentication-related HTTP requests including
 * login, register, token refresh, logout, and Google OAuth.
 *
 * @module api/auth
 */

import { apiClient } from './axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
} from '../types/auth';

/**
 * Register a new user with email and password
 *
 * @param data - Registration details (name, email, password)
 * @returns User data and access token
 * @throws Error if registration fails
 *
 * @example
 * ```typescript
 * const { user, accessToken } = await register({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'securepassword123'
 * });
 * ```
 */
export const register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Login with email and password
 *
 * Returns user data and access token. Refresh token is automatically
 * set as HttpOnly cookie by the backend.
 *
 * @param data - Login credentials (email, password)
 * @returns User data and access token
 * @throws Error if login fails
 *
 * @example
 * ```typescript
 * const { user, accessToken } = await login({
 *   email: 'john@example.com',
 *   password: 'securepassword123'
 * });
 * ```
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

/**
 * Refresh access token using refresh token from HttpOnly cookie
 *
 * The refresh token is automatically sent by the browser via cookies.
 * No need to explicitly include it in the request.
 *
 * This endpoint is called automatically by the axios interceptor
 * when a 401 error occurs.
 *
 * @returns New access token
 * @throws Error if refresh token is invalid or expired
 *
 * @example
 * ```typescript
 * const { accessToken } = await refreshAccessToken();
 * dispatch(setAccessToken(accessToken));
 * ```
 */
export const refreshAccessToken = async (): Promise<RefreshResponse> => {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh');
  return response.data;
};

/**
 * Logout user and invalidate refresh token
 *
 * Clears the refresh token cookie on the backend.
 * Frontend should clear Redux state after calling this.
 *
 * @throws Error if logout fails on backend
 *
 * @example
 * ```typescript
 * await logout();
 * dispatch(logoutAction());
 * ```
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

/**
 * Initiate Google OAuth login flow
 *
 * Redirects the browser to Google's consent screen.
 * After user approves, Google redirects to backend callback URL,
 * which then redirects to frontend with access token.
 *
 * This function causes a full page redirect, so it doesn't return.
 *
 * @example
 * ```typescript
 * // User clicks "Sign in with Google" button
 * googleLogin(); // Browser redirects to Google
 * ```
 */
export const googleLogin = (): void => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  window.location.href = `${baseURL}/auth/google`;
};

/**
 * Handle Google OAuth callback
 *
 * Called on the callback page (/auth/google/callback) after Google
 * redirects back. Extracts the access token from URL parameters.
 *
 * The backend has already validated the Google token, created/found
 * the user, and set the refresh token cookie. It redirects to the
 * frontend callback page with the access token in the URL.
 *
 * Expected URL format: /auth/google/callback?token=<access_token>
 *
 * @param token - Access token from URL query parameter
 * @returns User data (decoded from token or fetched from backend)
 * @throws Error if token is invalid or user fetch fails
 *
 * @example
 * ```typescript
 * // On GoogleCallbackPage component
 * const urlParams = new URLSearchParams(window.location.search);
 * const token = urlParams.get('token');
 * if (token) {
 *   const { user, accessToken } = await handleGoogleCallback(token);
 *   dispatch(setCredentials({ user, accessToken }));
 * }
 * ```
 */
export const handleGoogleCallback = async (
  token: string
): Promise<AuthResponse> => {
  // Option 1: Backend sends user data in redirect URL (simple)
  // For now, we'll fetch user data using the provided token

  // Set token temporarily to make authenticated request
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  try {
    // Fetch user profile with the access token
    const response = await apiClient.get<{ user: AuthResponse['user'] }>('/auth/me');

    return {
      user: response.data.user,
      accessToken: token,
    };
  } catch (error) {
    // Remove token on error
    delete apiClient.defaults.headers.common['Authorization'];
    throw error;
  }
};
