/**
 * Error handling utilities
 *
 * Provides functions to extract meaningful error messages from various error types,
 * especially axios errors which have nested error structures.
 *
 * @module utils/errorHandler
 */

import axios from 'axios';

/**
 * Extract user-friendly error message from various error types
 *
 * Handles axios errors by extracting the message from error.response.data,
 * which is the structure returned by our backend's JSONError function.
 *
 * @param error - The error object (axios error, Error, or unknown)
 * @param fallback - Default message if extraction fails
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   await createProblem(data);
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   toast.error(message); // Shows "Title must be at least 5 characters"
 * }
 * ```
 */
export const getErrorMessage = (
  error: unknown,
  fallback: string = 'An unexpected error occurred. Please try again.'
): string => {
  // Handle axios errors
  if (axios.isAxiosError(error)) {
    // Extract message from response data (backend format: {message: "error text"})
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Fallback to status text for network errors
    if (error.response?.statusText) {
      return error.response.statusText;
    }

    // Network errors (no response received)
    if (error.request && !error.response) {
      return 'Network error. Please check your connection.';
    }

    // Request setup errors
    if (error.message) {
      return error.message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return fallback;
};
