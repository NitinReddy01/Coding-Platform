import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true,
});

// Add request interceptor to include Supabase access token
apiClient.interceptors.request.use(
  async (config) => {
    // Get current session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Add Authorization header if session exists
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
