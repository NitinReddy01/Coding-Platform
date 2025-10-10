/**
 * Axios instances for API requests
 *
 * Provides two pre-configured axios instances:
 * - apiClient: For public routes (login, register, refresh)
 * - axiosPrivate: For protected routes (used with useAxiosPrivate hook)
 *
 * @module api/axios
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Public axios instance
 *
 * Use this for unauthenticated routes like login, register, and token refresh.
 * No interceptors attached - simple, direct requests.
 *
 * @example
 * ```typescript
 * import { apiClient } from './api/axios';
 * const response = await apiClient.post('/auth/login', credentials);
 * ```
 */
export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // Send cookies for refresh token
});

/**
 * Private axios instance
 *
 * Use this with the useAxiosPrivate hook for authenticated routes.
 * The hook attaches request/response interceptors for automatic
 * token injection and refresh on 401 errors.
 *
 * @example
 * ```typescript
 * import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
 *
 * function Component() {
 *   const axiosPrivate = useAxiosPrivate();
 *   const response = await axiosPrivate.get('/problems');
 * }
 * ```
 */
export const axiosPrivate = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // Send cookies for refresh token
});
