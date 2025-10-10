/**
 * Protected route component
 *
 * Route guard that prevents unauthenticated users from accessing
 * protected pages. Redirects to login page if not authenticated.
 *
 * @module components/auth/ProtectedRoute
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/store';

/**
 * Protected route wrapper
 *
 * Wraps routes that require authentication. If user is not authenticated,
 * redirects to login page and preserves the intended destination.
 *
 * Uses React Router's Outlet to render child routes.
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/problems/:id" element={<ProblemPage />} />
 *   <Route path="/profile" element={<ProfilePage />} />
 * </Route>
 * ```
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, but save the current location
    // so we can redirect back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes
  return <Outlet />;
};
