import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-[8px] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-accent text-text hover:bg-accent-hover',
  secondary: 'bg-surface-2 text-text hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.07)]',
  ghost: 'text-muted hover:text-text hover:bg-[rgba(255,255,255,0.05)]',
  danger: 'bg-danger text-white hover:bg-[#cc3333]',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-[44px] px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
