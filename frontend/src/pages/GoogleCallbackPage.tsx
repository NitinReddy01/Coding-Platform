/**
 * Google OAuth callback page component
 *
 * Handles the redirect from Google OAuth after user approval.
 * Extracts access token from URL, fetches user data, and redirects
 * to the problems page.
 *
 * @module pages/GoogleCallbackPage
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { handleGoogleCallback } from '../api/auth';
import { Card } from '../components/ui/card';


export const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          throw new Error('No access token found in URL');
        }

        // Fetch user data with the token
        const { user, accessToken } = await handleGoogleCallback(token);

        // Update Redux with credentials
        dispatch(setCredentials({ user, accessToken }));

        // Redirect to problems page
        navigate('/problems/1', { replace: true });
      } catch (err) {
        console.error('Google OAuth callback error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to complete Google sign-in'
        );
      }
    };

    processCallback();
  }, [dispatch, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Authentication Failed
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Login
          </button>
        </Card>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg
              className="animate-spin text-primary"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Completing Sign In
          </h1>
          <p className="text-muted-foreground">
            Please wait while we authenticate your account...
          </p>
        </div>
      </Card>
    </div>
  );
};
