import { apiClient } from './axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
  UserProfileResponse,
  RegisterResponse,
  VerificationResponse,
} from '../types/auth';
import type { AxiosInstance } from 'axios';

export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const refreshAccessToken = async (): Promise<RefreshResponse> => {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh');
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const getCurrentUser = async (axiosPrivate:AxiosInstance ): Promise<UserProfileResponse> => {
  const response = await axiosPrivate.get<UserProfileResponse>('/auth/me');
  return response.data;
};

export const googleLogin = (): void => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  window.location.href = `${baseURL}/auth/google`;
};

export const handleGoogleCallback = async (
  token: string
): Promise<AuthResponse> => {
  // Option 1: Backend sends user data in redirect URL (simple)
  // For now, we'll fetch user data using the provided token

  // Set token temporarily to make authenticated request
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  try {
    // Fetch user profile with the access token
    const response = await apiClient.get<{ user: AuthResponse['user'] }>('/auth/me');

    return {
      user: response.data.user,
      accessToken: token,
    };
  } catch (error) {
    // Remove token on error
    delete apiClient.defaults.headers.common['Authorization'];
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<VerificationResponse> => {
  const response = await apiClient.get<VerificationResponse>(`/auth/verify-email?token=${token}`);
  return response.data;
};

export const resendVerification = async (email: string): Promise<VerificationResponse> => {
  const response = await apiClient.post<VerificationResponse>('/auth/resend-verification', { email });
  return response.data;
};
