interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <span
      className={`font-bold tracking-[-0.03em] text-text ${sizes[size]} ${className}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      Clae
    </span>
  );
}
