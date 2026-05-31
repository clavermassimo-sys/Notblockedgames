import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  CircleDollarSign,
  PieChart,
  Building2,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import type { ReactNode } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stocks', icon: TrendingUp, label: 'Stocks' },
  { to: '/crypto', icon: CircleDollarSign, label: 'Crypto' },
  { to: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { to: '/bank', icon: Building2, label: 'Bank' },
  { to: '/referrals', icon: Users, label: 'Referrals' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Account';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full bg-bg">
      {/* Sidebar */}
      <aside
        className="w-[232px] shrink-0 flex flex-col h-full bg-surface"
        style={{ borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Logo size="md" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium
                transition-colors duration-150 no-underline
                ${isActive
                  ? 'bg-[rgba(15,122,78,0.12)] text-accent'
                  : 'text-muted hover:text-text hover:bg-[rgba(255,255,255,0.04)]'
                }
              `}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[8px]">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-text shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{displayName}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-muted hover:text-text hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-150 w-full text-left"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
