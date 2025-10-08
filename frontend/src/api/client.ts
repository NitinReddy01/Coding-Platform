/**
 * Axios HTTP client for API requests
 *
 * Pre-configured with base URL, timeouts, and interceptors
 * for authentication and error handling.
 *
 * @module api/client
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Pre-configured axios instance for making API requests
 *
 * - Base URL: Configured via VITE_API_BASE_URL env variable (defaults to localhost:4000/api)
 * - Timeout: 30 seconds (sufficient for code execution)
 * - Headers: JSON content type
 * - Interceptors: Authentication and error handling
 *
 * @example
 * ```typescript
 * import { apiClient } from './api/client';
 *
 * const response = await apiClient.get('/problems/1');
 * ```
 */
export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for code execution
});

/**
 * Request interceptor for adding authentication tokens
 *
 * Currently a placeholder for future JWT token implementation.
 * Will automatically add Authorization header when auth is implemented.
 */
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add JWT token from localStorage/Redux when auth is implemented
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for centralized error handling
 *
 * Transforms axios errors into user-friendly error messages:
 * - Server errors: Extracts error message from response
 * - Network errors: Shows connection error message
 * - Other errors: Passes through original error
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.statusText;
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      return Promise.reject(error);
    }
  }
);
