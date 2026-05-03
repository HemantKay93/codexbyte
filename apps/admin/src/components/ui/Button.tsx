import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded';
    
    const variants = {
      primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container',
      secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-variant',
      ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
      outline: 'bg-transparent border border-outline text-on-surface hover:bg-surface-container-high',
      danger: 'bg-error text-on-error hover:bg-error-container hover:text-on-error-container',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-body-sm',
      md: 'px-4 py-2 text-button',
      lg: 'px-6 py-3 text-h2',
    };

    const classes = [
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <button ref={ref} className={classes} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
