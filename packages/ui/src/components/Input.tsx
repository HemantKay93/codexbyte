import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, fullWidth = false, label, id, ...props }, ref) => {
    const baseStyles = 'flex h-10 rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface ring-offset-surface file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    
    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-on-surface mb-1">
            {label}
          </label>
        )}
        <input 
          ref={ref} 
          id={id}
          className={cn(
            baseStyles,
            error && 'border-error focus-visible:ring-error',
            fullWidth && 'w-full',
            className
          )} 
          {...props} 
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
