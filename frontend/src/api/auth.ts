import { apiClient } from './axios';
import type { UserProfileResponse } from '../types/auth';

/**
 * Sync Supabase user with backend database
 * Creates user record with roles after Supabase authentication
 */
export const syncUser = async (name?: string): Promise<UserProfileResponse['user']> => {
  const response = await apiClient.post<UserProfileResponse>('/auth/sync', { name });
  const user = {...response.data.user,roles:response.data.roles}
  return user;
};
