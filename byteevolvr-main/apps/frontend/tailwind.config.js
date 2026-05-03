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
        accent: {
          DEFAULT: '#60A5FA',
          glow: 'rgba(96, 165, 250, 0.3)',
        },
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
