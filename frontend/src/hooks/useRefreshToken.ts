/**
 * Token refresh hook
 *
 * Provides a function to refresh the access token using the refresh token
 * stored in HttpOnly cookies. Updates Redux state with the new token.
 *
 * @module hooks/useRefreshToken
 */

import { useCallback } from 'react';
import { apiClient } from '../api/axios';
import { useAppDispatch } from '../store/store';
import { setAccessToken } from '../store/slices/authSlice';
import type { RefreshResponse } from '../types/auth';

/**
 * Custom hook for refreshing access tokens
 *
 * Returns a function that calls the refresh endpoint and updates Redux
 * with the new access token. Uses the public apiClient to avoid circular
 * dependency with interceptors.
 *
 * The refresh token is sent automatically via HttpOnly cookie.
 *
 * @returns Refresh function that returns the new access token
 *
 * @example
 * ```typescript
 * const refresh = useRefreshToken();
 *
 * try {
 *   const newToken = await refresh();
 *   console.log('Token refreshed:', newToken);
 * } catch (error) {
 *   console.error('Refresh failed:', error);
 *   // User will be logged out by interceptor
 * }
 * ```
 */
export const useRefreshToken = () => {
  const dispatch = useAppDispatch();

  const refresh = useCallback(async (): Promise<string> => {
    try {
      // Call refresh endpoint (refresh token sent via cookie)
      const response = await apiClient.post<RefreshResponse>('/auth/refresh');
      const { accessToken } = response.data;

      // Update Redux store with new access token
      dispatch(setAccessToken(accessToken));

      return accessToken;
    } catch (error) {
      // If refresh fails, let the error propagate
      // The interceptor will handle logout
      throw error;
    }
  }, [dispatch]);

  return refresh;
};
