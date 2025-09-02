import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/',
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:30002',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom']
          }
        }
      }
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      // Ensure environment variables are available in production
      'import.meta.env.VITE_SITE_URL': JSON.stringify(env.VITE_SITE_URL),
      'import.meta.env.MODE': JSON.stringify(mode)
    }
  }
})
