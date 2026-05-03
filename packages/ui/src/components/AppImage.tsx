import type { ImgHTMLAttributes } from 'react';

type AppImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export function AppImage({ fallbackSrc = '/assets/images/no_image.png', onError, loading = 'lazy', style, ...props }: AppImageProps) {
  return (
    <img
      {...props}
      loading={loading}
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        ...style
      }}
      onError={(event) => {
        if (event.currentTarget.src !== fallbackSrc) {
          event.currentTarget.src = fallbackSrc;
        }
        onError?.(event);
      }}
    />
  );
}
