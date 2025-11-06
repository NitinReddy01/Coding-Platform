import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, type RootState } from '../store/store';
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setPersist as setPersistAction,
} from '../store/slices/authSlice';
import * as authAPI from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../types/auth';

interface UseAuthReturn {
  /** Current user data (null if not authenticated) */
  user: RootState['auth']['user'];
  isAuthenticated: boolean;
  loading: boolean;
  persist: boolean;
  roles: string[];
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setPersist: (persist: boolean) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (...roles: string[]) => boolean;
  isAdmin: () => boolean;
  isAuthor: () => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, persist } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(setLoading(true));

        const { user, accessToken } = await authAPI.login(credentials);

        // Update Redux with user and token
        dispatch(setCredentials({ user, accessToken }));

        // Navigate to problems list page
        navigate('/problems');
      } catch (error) {
        dispatch(setLoading(false));
        throw error; // Re-throw to let component handle error display
      }
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        dispatch(setLoading(true));

        const { message, email } = await authAPI.register(data);

        // Registration successful - user needs to verify email
        // No tokens returned, so don't set credentials
        dispatch(setLoading(false));

        // Navigate to verification sent page with email and message
        navigate('/verify-email-sent', { state: { email, message } });
      } catch (error) {
        dispatch(setLoading(false));
        throw error; // Re-throw to let component handle error display
      }
    },
    [dispatch, navigate]
  );


  const logout = useCallback(async () => {
    try {
      // Call backend to invalidate refresh token
      await authAPI.logout();
    } catch (error) {
      // Log error but continue with local logout
      console.error('Logout API call failed:', error);
    } finally {
      // Clear Redux state regardless of API call result
      dispatch(logoutAction());

      // Navigate to login page
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const setPersist = useCallback(
    (persist: boolean) => {
      dispatch(setPersistAction(persist));
    },
    [dispatch]
  );

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
    persist,
    roles,
    login,
    register,
    logout,
    setPersist,
    hasRole,
    hasAnyRole,
    isAdmin,
    isAuthor,
  };
};
