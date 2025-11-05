import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useRefreshToken } from '../../hooks/useRefreshToken';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setLanguages, setLanguagesLoading, setLanguagesError } from '../../store/slices/editorSlice';
import { setUserProfile } from '../../store/slices/authSlice';
import { fetchLanguages } from '../../api/problems';
import { getCurrentUser } from '../../api/auth';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { getErrorMessage } from '../../utils/errorHandler';

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

    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (error) {
        console.error('Token refresh failed:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user && !accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, persist, accessToken, refresh]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!accessToken || !user || user.roles) return;

      try {
        const { user: userProfile, roles } = await getCurrentUser(axios);
        dispatch(setUserProfile({ ...userProfile, roles }));
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Don't block the app if profile fetch fails
      }
    };

    loadUserProfile();
  }, [accessToken, user, dispatch]);


  useEffect(() => {
    const loadLanguages = async () => {
      // Only fetch if user is authenticated and languages haven't been loaded
      if (!accessToken || languages.length > 0) return;

      try {
        dispatch(setLanguagesLoading(true));
        const fetchedLanguages = await fetchLanguages(axios);
        dispatch(setLanguages(fetchedLanguages));
      } catch (error) {
        const message = getErrorMessage(error, 'Failed to load languages');
        dispatch(setLanguagesError(message));
        console.error('Failed to fetch languages:', error);
      }
    };

    loadLanguages();
  }, [accessToken, languages.length, axios, dispatch]);

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
