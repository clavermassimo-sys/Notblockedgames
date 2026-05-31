import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';

  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    setError('');

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setResent(true);
    }
    setLoading(false);
  }

  return (
    <AuthLayout>
      <Card>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[rgba(15,122,78,0.12)] flex items-center justify-center">
            <Mail size={22} className="text-accent" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-text">Check your inbox</h1>
            <p className="text-sm text-muted leading-relaxed">
              We sent a verification link to{' '}
              {email ? (
                <span className="text-text font-medium">{email}</span>
              ) : (
                'your email address'
              )}
              . Click the link to activate your account.
            </p>
          </div>

          {resent && (
            <div className="w-full flex items-center gap-2 rounded-[8px] bg-[rgba(15,122,78,0.08)] border border-[rgba(15,122,78,0.2)] px-4 py-3">
              <CheckCircle2 size={15} className="text-accent shrink-0" />
              <p className="text-sm text-accent">Verification email resent.</p>
            </div>
          )}

          {error && (
            <div className="w-full rounded-[8px] bg-[rgba(229,62,62,0.08)] border border-[rgba(229,62,62,0.2)] px-4 py-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            {email && !resent && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleResend}
                loading={loading}
              >
                Resend email
              </Button>
            )}
            <Link to="/login" className="text-sm text-muted hover:text-text transition-colors">
              Back to sign in
            </Link>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}
