import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') ?? '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email, password, fullName);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    navigate('/verify-email', { state: { email } });
  }

  return (
    <AuthLayout>
      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-text">Create your account</h1>
            <p className="text-sm text-muted">Start investing in stocks and crypto</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoFocus
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              hint="Must be at least 8 characters"
            />

            {referralCode && (
              <div className="flex items-center gap-2 rounded-[8px] bg-[rgba(15,122,78,0.08)] border border-[rgba(15,122,78,0.2)] px-4 py-3">
                <p className="text-sm text-accent">Referral code applied: {referralCode}</p>
              </div>
            )}

            {error && (
              <div className="rounded-[8px] bg-[rgba(229,62,62,0.08)] border border-[rgba(229,62,62,0.2)] px-4 py-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="text-xs text-muted text-center px-2">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>

          <div style={{ borderTop: '1px solid var(--border)' }} className="pt-5">
            <p className="text-sm text-muted text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-text font-medium hover:text-accent transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}
