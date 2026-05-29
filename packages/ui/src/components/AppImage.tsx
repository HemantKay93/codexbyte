import { useState, type ImgHTMLAttributes } from 'react';

type AppImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export function AppImage({
  fallbackSrc = '/assets/images/no_image.png',
  onError,
  loading = 'lazy',
  style,
  className,
  src,
  ...props
}: AppImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Generate a WebP variant if possible (standard suffix replacement)
  const isCdnOrStatic =
    src && (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg'));
  const webpSrc = isCdnOrStatic ? src.replace(/\.(png|jpg|jpeg)$/, '.webp') : undefined;

  return (
    <picture style={{ display: 'block', width: '100%', height: '100%' }}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        {...props}
        src={currentSrc}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        className={`${className || ''}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          transition:
            'filter 0.5s ease-in-out, opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
          filter: isLoaded ? 'none' : 'blur(8px)',
          transform: isLoaded ? 'scale(1)' : 'scale(1.02)',
          opacity: isLoaded ? 1 : 0.6,
          ...style,
        }}
        onError={(event) => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
          onError?.(event);
        }}
      />
    </picture>
  );
}
