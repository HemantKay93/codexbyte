import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius,
  style: customStyle,
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: borderRadius,
    backgroundColor: '#e2e8f0',
    backgroundImage: 'linear-gradient(90deg, #e2e8f0 0px, #f8fafc 40px, #e2e8f0 80px)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite linear',
    ...customStyle,
  };

  return <div className={`skeleton ${className}`} style={style} />;
};

// Add CSS keyframes to a global style or the component itself
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-keyframes';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.innerHTML = `
      @keyframes skeleton-loading {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }
    `;
    document.head.appendChild(styleTag);
  }
}
