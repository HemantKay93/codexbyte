import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padding = true, hoverable = false, ...props }, ref) => {
    const baseStyles = 'rounded-xl border border-outline-variant bg-surface text-on-surface shadow-card overflow-hidden';
    
    return (
      <div 
        ref={ref} 
        className={cn(
          baseStyles,
          padding && 'p-6',
          hoverable && 'transition-all hover:shadow-md hover:border-primary',
          className
        )} 
        {...props} 
      />
    );
  }
);

Card.displayName = 'Card';
