import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import * as authAPI from '../api/auth';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [closeCountdown, setCloseCountdown] = useState(3);

  const token = searchParams.get('token');

  // Verify email on mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token found in URL');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');

        // Notify other tabs via localStorage
        localStorage.setItem('emailVerified', Date.now().toString());
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Failed to verify email. The link may be invalid or expired.'
        );
      }
    };

    verifyEmail();
  }, [token]);

  // Countdown and auto-close on success
  useEffect(() => {
    if (status === 'success' && closeCountdown > 0) {
      const timer = setTimeout(() => {
        setCloseCountdown(closeCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (status === 'success' && closeCountdown === 0) {
      // Try to close the tab
      window.close();

      // If window.close() doesn't work (browser security), redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 500);
    }
  }, [status, closeCountdown, navigate]);

  const handleResendVerification = () => {
    navigate('/verify-email-sent', {
      state: {
        email: '',
        message: 'Enter your email to resend verification',
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md space-y-6 p-8">
        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Verifying Your Email
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-4">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Email Verified!
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <p className="text-sm font-medium text-foreground">
                You can now login to your account
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              Closing this tab in {closeCountdown} second
              {closeCountdown !== 1 ? 's' : ''}...
            </div>
            <Button onClick={() => window.close()} className="w-full">
              Close This Tab
            </Button>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Verification Failed
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {/* Error actions */}
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
              >
                Resend Verification Email
              </Button>
              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
