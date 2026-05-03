interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 64 }: AppLogoProps) {
  return (
    <img
      src="/assets/images/logo.webp"
      alt="ByteeVolvr logo"
      style={{ maxWidth: size * 2, height: 'auto', maxHeight: size }}
      className="shrink-0 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
      loading="eager"
    />
  );
}
