import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/bundle-analysis.html',
      open: false,
      title: 'ByteEvolvr Admin Bundle Analysis'
    })
  ],
  envDir: path.resolve(__dirname, '../..'),
  server: {
    host: '0.0.0.0',
    port: 4031,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['xlsx', 'date-fns']
        }
      }
    }
  }
});
