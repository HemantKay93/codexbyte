import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, style, icon, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 'var(--space-3)', color: 'var(--color-text-muted)', display: 'flex' }}>
            {icon}
          </div>
        )}
        <input
          style={{
            width: '100%',
            padding: icon ? 'var(--space-3) var(--space-4) var(--space-3) 40px' : 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'var(--transition-fast)',
            ...style,
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{error}</span>}
      {!error && helperText && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{helperText}</span>
      )}
    </div>
  );
};
