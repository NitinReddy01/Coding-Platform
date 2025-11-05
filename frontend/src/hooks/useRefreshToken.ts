import { useCallback } from 'react';
import { apiClient } from '../api/axios';
import { useAppDispatch } from '../store/store';
import { setAccessToken } from '../store/slices/authSlice';
import type { RefreshResponse } from '../types/auth';

export const useRefreshToken = () => {
  const dispatch = useAppDispatch();

  const refresh = useCallback(async (): Promise<string> => {
    try {
      const response = await apiClient.post<RefreshResponse>('/auth/refresh');
      const { accessToken } = response.data;

      dispatch(setAccessToken(accessToken));

      return accessToken;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return refresh;
};
