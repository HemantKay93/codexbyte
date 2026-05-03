import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: boolean;
  hoverable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, padding = true, style, className }) => {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'var(--transition-base)',
        padding: padding ? 'var(--space-6)' : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
