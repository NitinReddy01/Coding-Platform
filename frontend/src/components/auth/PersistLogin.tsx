import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setLanguages, setLanguagesLoading, setLanguagesError } from '../../store/slices/editorSlice';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { fetchLanguages } from '../../api/problems';
import { syncUser } from '../../api/auth';
import { supabase } from '../../lib/supabaseClient';
import { apiClient } from '../../api/axios';
import { getErrorMessage } from '../../utils/errorHandler';

export const PersistLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { languages } = useAppSelector((state) => state.editor);
  const dispatch = useAppDispatch();

  // Always validate Supabase session on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check if there's an active Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Valid session exists - sync with backend to get user profile
          // Backend will return existing user or create new one
          const userProfile = await syncUser();
          dispatch(setCredentials({ user: userProfile }));
        } else {
          // No valid session - clear auth state
          dispatch(logout());
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        // On error, clear auth state to be safe
        dispatch(logout());
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Listen to Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('Supabase auth event:', event);

      if (event === 'SIGNED_OUT') {
        // User signed out - clear Redux state
        dispatch(logout());
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token refreshed - ensure user is still authenticated
        // console.log('Token refreshed successfully');
      } else if (event === 'USER_UPDATED' && session) {
        // User data updated - optionally re-sync with backend
        // console.log('User data updated');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    const loadLanguages = async () => {
      // Only fetch if user is authenticated and languages haven't been loaded
      if (!isAuthenticated || languages.length > 0) return;

      try {
        dispatch(setLanguagesLoading(true));
        const fetchedLanguages = await fetchLanguages(apiClient);
        dispatch(setLanguages(fetchedLanguages));
      } catch (error) {
        const message = getErrorMessage(error, 'Failed to load languages');
        dispatch(setLanguagesError(message));
        console.error('Failed to fetch languages:', error);
      }
    };

    loadLanguages();
  }, [isAuthenticated, languages.length, dispatch]);

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

  return <Outlet />;
};
