/**
 * Private axios hook with authentication interceptors
 *
 * Provides an axios instance with automatic token injection and refresh.
 * Interceptors are mounted when component mounts and cleaned up on unmount
 * to prevent memory leaks and duplicate interceptors.
 *
 * @module hooks/useAxiosPrivate
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import { useRefreshToken } from './useRefreshToken';
import { useAppSelector, useAppDispatch } from '../store/store';
import { logout } from '../store/slices/authSlice';

/**
 * Custom hook for authenticated axios requests
 *
 * Attaches request and response interceptors to the axiosPrivate instance:
 * - Request: Automatically adds Authorization header with access token
 * - Response: Handles 401 errors by refreshing token and retrying request
 *
 * Interceptors are cleaned up on component unmount to prevent memory leaks.
 *
 * @returns Configured axios instance with interceptors
 *
 * @example
 * ```typescript
 * import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
 *
 * function ProblemsPage() {
 *   const axiosPrivate = useAxiosPrivate();
 *
 *   const fetchProblems = async () => {
 *     const response = await axiosPrivate.get('/problems');
 *     return response.data;
 *   };
 * }
 * ```
 */
export const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    /**
     * Request interceptor - Add authorization header
     *
     * Injects the Bearer token from Redux into every request.
     * Only adds if Authorization header is not already present.
     */
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    /**
     * Response interceptor - Handle token refresh on 401
     *
     * When a request fails with 401 (Unauthorized):
     * 1. Attempt to refresh the access token
     * 2. Update the failed request with new token
     * 3. Retry the original request
     * 4. If refresh fails, logout and redirect to login
     *
     * Uses `sent` flag to prevent infinite retry loops.
     */
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        // Handle 401 Unauthorized - token expired
        if (error?.response?.status === 401 && !prevRequest.sent) {
          prevRequest.sent = true; // Prevent retry loop

          try {
            // Attempt to refresh access token
            const newAccessToken = await refresh();

            // Update failed request with new token
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Retry original request with new token
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            dispatch(logout());
            navigate('/login', { replace: true });

            return Promise.reject(refreshError);
          }
        }

        // For other errors, reject as-is
        return Promise.reject(error);
      }
    );

    /**
     * Cleanup function - Eject interceptors on unmount
     *
     * Prevents memory leaks and duplicate interceptors when
     * components mount/unmount multiple times.
     */
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, refresh, navigate, dispatch]);

  return axiosPrivate;
};
