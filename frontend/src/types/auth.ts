export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface UserProfileResponse {
  user: User;
  roles: string[];
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface VerificationResponse {
  message: string;
  email?: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  persist: boolean;
}
