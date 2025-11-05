import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import { useRefreshToken } from './useRefreshToken';
import { useAppSelector, useAppDispatch } from '../store/store';
import { logout } from '../store/slices/authSlice';

export const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        // Handle 401 Unauthorized - token expired
        if (error?.response?.status === 401 && !prevRequest.sent) {
          prevRequest.sent = true; // Prevent retry loop

          try {
            // Attempt to refresh access token
            const newAccessToken = await refresh();

            // Update failed request with new token
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Retry original request with new token
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            dispatch(logout());
            navigate('/login', { replace: true });

            return Promise.reject(refreshError);
          }
        }

        // For other errors, reject as-is
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, refresh, navigate, dispatch]);

  return axiosPrivate;
};
