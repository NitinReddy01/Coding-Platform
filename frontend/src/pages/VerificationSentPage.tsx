import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabaseClient';

interface LocationState {
  email: string;
  message: string;
}

export default function VerificationSentPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!state?.email || resending || countdown > 0) return;

    try {
      setResending(true);
      setResendError('');
      setResendSuccess(false);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.email,
      });

      if (error) throw error;

      setResendSuccess(true);
      setCountdown(60); // Reset countdown

      // Clear success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      setResendError(
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email'
      );
    } finally {
      setResending(false);
    }
  };

  if (!state?.email) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md space-y-6 p-8">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Mail className="h-16 w-16 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
          <p className="text-sm text-muted-foreground">
            {state.message || 'We sent a verification link to your email'}
          </p>
        </div>

        {/* Email display */}
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-sm font-medium text-foreground">{state.email}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Click the verification link in the email to activate your account.</p>
          <p className="text-warning">The link will expire in 30 minutes.</p>
        </div>

        {/* Success message */}
        {resendSuccess && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            <span>Verification email sent! Check your inbox.</span>
          </div>
        )}

        {/* Error message */}
        {resendError && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{resendError}</span>
          </div>
        )}

        {/* Resend button */}
        <Button
          onClick={handleResendVerification}
          disabled={countdown > 0 || resending}
          variant="outline"
          className="w-full"
        >
          {resending
            ? 'Sending...'
            : countdown > 0
            ? `Resend in ${countdown}s`
            : 'Resend Verification Email'}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Link to login */}
        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already verified?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
