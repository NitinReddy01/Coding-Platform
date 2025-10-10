/**
 * Public axios client for API requests
 *
 * This is a simple axios instance for unauthenticated routes.
 * For authenticated routes, use the useAxiosPrivate hook instead.
 *
 * @module api/client
 * @deprecated Use apiClient from './axios' for public routes and useAxiosPrivate hook for protected routes
 */

export { apiClient } from './axios';
