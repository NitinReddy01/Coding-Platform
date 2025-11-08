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

export interface UserProfileResponse {
  user: User;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  // Note: Supabase manages tokens and session persistence internally - no need to store in Redux
}
