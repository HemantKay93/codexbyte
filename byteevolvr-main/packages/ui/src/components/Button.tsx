import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  style,
  disabled,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-base)',
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-display)',
    gap: 'var(--space-2)',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
      color: 'white',
      boxShadow: 'var(--shadow-glow)',
    },
    secondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary-light)',
      border: '1px solid var(--color-primary-light)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-muted)',
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: 'var(--space-2) var(--space-4)', fontSize: '0.875rem' },
    md: { padding: 'var(--space-3) var(--space-6)', fontSize: '1rem' },
    lg: { padding: 'var(--space-4) var(--space-8)', fontSize: '1.125rem' },
  };

  const finalStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    opacity: disabled || isLoading ? 0.6 : 1,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <button style={finalStyle} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
