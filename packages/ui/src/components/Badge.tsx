import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'md', className, style }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'rgba(26, 79, 214, 0.12)',
      color: 'var(--color-accent)',
      border: '1px solid rgba(96, 165, 250, 0.2)',
    },
    secondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-text-muted)',
      border: '1px solid var(--color-border)',
    },
    success: {
      background: 'rgba(16, 185, 129, 0.12)',
      color: '#34D399',
      border: '1px solid rgba(52, 211, 153, 0.2)',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.12)',
      color: '#FBBF24',
      border: '1px solid rgba(251, 191, 36, 0.2)',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.12)',
      color: '#F87171',
      border: '1px solid rgba(248, 113, 113, 0.2)',
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '2px 8px', fontSize: '0.7rem' },
    md: { padding: '4px 10px', fontSize: '0.75rem' },
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </span>
  );
};
