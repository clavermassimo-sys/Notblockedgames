import { Link } from 'react-router-dom';
import { AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/commission';

export function DashboardPage() {
  const { profile, user } = useAuth();
  const kycApproved = profile?.kyc_status === 'approved';
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <AppLayout>
      <div className="p-8 flex flex-col gap-6 max-w-[1080px]">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-text tracking-[-0.01em]">
            Good morning, {displayName}
          </h1>
          <p className="text-sm text-muted">Here&apos;s your portfolio overview.</p>
        </div>

        {/* KYC banner */}
        {!kycApproved && (
          <div
            className="flex items-start gap-4 rounded-[12px] p-5"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col gap-2">
              <div>
                <p className="text-sm font-medium text-text">Identity verification required</p>
                <p className="text-sm text-muted mt-0.5">
                  You need to verify your identity before you can buy or sell. It takes about 2 minutes.
                </p>
              </div>
              <div>
                <Link to="/kyc">
                  <Button size="sm" className="mt-1">
                    Start verification
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">Portfolio value</p>
              <p className="text-2xl font-semibold text-text tracking-tight">
                {formatCurrency(0)}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted">
                <span>All time</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">Today&apos;s change</p>
              <p className="text-2xl font-semibold text-text tracking-tight">
                {formatCurrency(0)}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted">
                <span>0.00%</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">Cash balance</p>
              <p className="text-2xl font-semibold text-text tracking-tight">
                {formatCurrency(profile?.cash_balance ?? 0)}
              </p>
              <Link to="/bank" className="text-xs text-accent hover:underline mt-0.5">
                Add funds
              </Link>
            </div>
          </Card>
        </div>

        {/* Holdings */}
        <Card padding="sm">
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            <h2 className="text-sm font-semibold text-text">Holdings</h2>
            <div className="flex gap-2">
              <Link to="/stocks">
                <Button variant="ghost" size="sm">
                  <TrendingUp size={14} />
                  Buy stocks
                </Button>
              </Link>
            </div>
          </div>
          <EmptyState
            icon={<TrendingUp size={20} className="text-muted" />}
            title="No holdings yet"
            description="Buy your first stock or crypto to get started."
          />
        </Card>

        {/* Recent transactions */}
        <Card padding="sm">
          <div className="px-2 py-2 mb-2">
            <h2 className="text-sm font-semibold text-text">Recent transactions</h2>
          </div>
          <EmptyState
            icon={<Clock size={20} className="text-muted" />}
            title="No transactions yet"
            description="Your trade history will appear here."
          />
        </Card>

      </div>
    </AppLayout>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text">{title}</p>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

