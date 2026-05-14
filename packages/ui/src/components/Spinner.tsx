interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color = 'var(--color-primary)' }: SpinnerProps) {
  const sizes = {
    sm: 20,
    md: 40,
    lg: 60,
  };

  const dimension = sizes[size];

  return (
    <div style={{ display: 'inline-block' }}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 50 50"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="90, 150"
        />
      </svg>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
