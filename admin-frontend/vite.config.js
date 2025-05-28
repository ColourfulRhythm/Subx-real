import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:30007',
        changeOrigin: true,
      },
    },
  },
  css: {
    postcss: './postcss.config.cjs',
  },
}); 