/**
 * Persist login component
 *
 * Wrapper component that attempts to refresh the access token on app mount
 * if the user has enabled "Remember Me" and a refresh token exists.
 *
 * This enables session persistence across browser restarts.
 *
 * @module components/auth/PersistLogin
 */

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useRefreshToken } from '../../hooks/useRefreshToken';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setLanguages, setLanguagesLoading, setLanguagesError } from '../../store/slices/editorSlice';
import { fetchLanguages } from '../../api/problems';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';

/**
 * Persist login wrapper
 *
 * Wraps the entire app to handle token refresh on mount.
 * Shows a loading state while attempting to refresh the token.
 *
 * Flow:
 * 1. Check if persist is enabled and user exists but no accessToken
 * 2. If yes, attempt to refresh the access token
 * 3. On success, user stays logged in
 * 4. On failure, user will be redirected to login by ProtectedRoute
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <BrowserRouter>
 *   <PersistLogin>
 *     <Routes>
 *       <Route path="/login" element={<LoginPage />} />
 *       <Route element={<ProtectedRoute />}>
 *         <Route path="/problems/:id" element={<ProblemPage />} />
 *       </Route>
 *     </Routes>
 *   </PersistLogin>
 * </BrowserRouter>
 * ```
 */
export const PersistLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { user, persist } = useAuth();
  const { accessToken } = useAppSelector((state) => state.auth);
  const { languages } = useAppSelector((state) => state.editor);
  const dispatch = useAppDispatch();
  const axios = useAxiosPrivate();

  useEffect(() => {
    let isMounted = true;

    /**
     * Verify and refresh token if needed
     */
    const verifyRefreshToken = async () => {
      try {
        // Attempt to get new access token using refresh token from cookie
        await refresh();
      } catch (error) {
        // If refresh fails, user will be redirected to login by ProtectedRoute
        console.error('Token refresh failed:', error);
      } finally {
        // Only update state if component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Attempt refresh if user exists but no accessToken
    // This handles two cases:
    // 1. Page refresh during active session (even without "Remember me")
    // 2. Browser restart with "Remember me" enabled
    // The persist flag only affects whether user data is kept in localStorage
    if (user && !accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [user, persist, accessToken, refresh]);

  /**
   * Fetch languages when user is authenticated and languages haven't been loaded
   */
  useEffect(() => {
    const loadLanguages = async () => {
      // Only fetch if user is authenticated and languages haven't been loaded
      if (!accessToken || languages.length > 0) return;

      try {
        dispatch(setLanguagesLoading(true));
        const fetchedLanguages = await fetchLanguages(axios);
        dispatch(setLanguages(fetchedLanguages));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load languages';
        dispatch(setLanguagesError(message));
        console.error('Failed to fetch languages:', error);
      }
    };

    loadLanguages();
  }, [accessToken, languages.length, axios, dispatch]);

  // Show loading state while refreshing token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render child routes
  return <Outlet />;
};
