/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', 
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A4FD6',
          light: '#3B7BF8',
          dark: '#1240B0',
        },
        'on-primary': '#ffffff',
        'primary-container': 'rgba(26, 79, 214, 0.12)',
        'on-primary-container': '#60A5FA',
        accent: {
          DEFAULT: '#60A5FA',
          glow: 'rgba(96, 165, 250, 0.3)',
        },
        surface: 'rgba(255, 255, 255, 0.03)',
        'surface-variant': 'rgba(255, 255, 255, 0.05)',
        'surface-container-high': 'rgba(255, 255, 255, 0.07)',
        'on-surface': '#E8EDF5',
        'on-surface-variant': '#8B9BB8',
        'outline': 'rgba(255, 255, 255, 0.12)',
        'outline-variant': 'rgba(255, 255, 255, 0.07)',
        error: '#EF4444',
        'on-error': '#ffffff',
        'error-container': 'rgba(239, 68, 68, 0.12)',
        'on-error-container': '#F87171',
        success: '#10B981',
        warning: '#F59E0B',
        brand: {
          bg: '#04080F',
          bg2: '#070D1A',
          bg3: '#0A1628',
          surface: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.07)',
          fg: '#E8EDF5',
          muted: '#8B9BB8',
          subtle: '#4A5568',
        },
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
