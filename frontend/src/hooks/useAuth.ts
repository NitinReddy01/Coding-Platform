import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, type RootState } from '../store/store';
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
} from '../store/slices/authSlice';
import { supabase } from '../lib/supabaseClient';
import * as authAPI from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../types/auth';

interface UseAuthReturn {
  /** Current user data (null if not authenticated) */
  user: RootState['auth']['user'];
  isAuthenticated: boolean;
  loading: boolean;
  roles: string[];
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (...roles: string[]) => boolean;
  isAdmin: () => boolean;
  isAuthor: () => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(setLoading(true));

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data.user || !data.session) {
          throw new Error('Login failed - no user or session returned');
        }

        // Sync user with backend to get roles and create user record
        const userProfile = await authAPI.syncUser();

        // Update Redux with user profile (includes roles from backend)
        // This also sets loading to false and isAuthenticated to true
        dispatch(setCredentials({ user: userProfile }));

        // Navigation is handled by LoginPage useEffect when isAuthenticated becomes true
        // Do NOT navigate here to avoid race conditions
      } catch (error) {
        // Clean up on error - sign out from Supabase to avoid invalid session state
        await supabase.auth.signOut();

        // Ensure loading state is cleared
        dispatch(setLoading(false));

        throw error; // Re-throw to let component handle error display
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        dispatch(setLoading(true));

        console.log('Starting Supabase signup...', { email: data.email });

        // Sign up with Supabase (sends verification email automatically)
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
            },
          },
        });

        console.log('Supabase signup response:', { authData, error });

        if (error) {
          console.error('Supabase signup error:', error);
          throw new Error(error.message);
        }

        dispatch(setLoading(false));

        // Navigate to verification sent page
        navigate('/verify-email-sent', {
          state: {
            email: data.email,
            message: 'Please check your email to verify your account.',
          },
        });
      } catch (error) {
        console.error('Register catch block error:', error);

        // Clean up on error - sign out from Supabase to avoid invalid session state
        await supabase.auth.signOut();

        // Ensure loading state is cleared
        dispatch(setLoading(false));

        throw error; // Re-throw to let component handle error display
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      // Log error but continue with local logout
      console.error('Supabase logout failed:', error);
    } finally {
      // Clear Redux state regardless of API call result
      dispatch(logoutAction());

      // Navigate to login page
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const roles = user?.roles || [];

  const hasRole = useCallback(
    (role: string): boolean => {
      return roles.includes(role);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    (...checkRoles: string[]): boolean => {
      return checkRoles.some((role) => roles.includes(role));
    },
    [roles]
  );

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const isAuthor = useCallback((): boolean => {
    return hasRole('author');
  }, [hasRole]);

  return {
    user,
    isAuthenticated,
    loading,
    roles,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isAuthor,
  };
};
