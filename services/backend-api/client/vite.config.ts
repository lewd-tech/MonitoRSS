import { defineConfig, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const VITE_ENV = process.env.ENV || 'development'

// Docker-specific configurations
const API_PROXY_URL = process.env.API_PROXY_URL || 'http://localhost:8000'
// Cannot get non-polling to work with Docker, so this is a workaround
const VITE_USE_POLLING = Boolean(process.env.VITE_USE_POLLING) || false

const proxyOptionsByEnv: Record<string, Record<string, ProxyOptions>> = {
  'development': {
    '/api': {
      target: API_PROXY_URL,
      changeOrigin: true,
    }
  },
  'production': {
    '/api': {
      target: 'https://cp.monitorss.xyz',
      changeOrigin: true,
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: './public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  server: {
    proxy: proxyOptionsByEnv[VITE_ENV] || {},
    watch: {
      usePolling: VITE_USE_POLLING,
    }
  },
  build: {
    sourcemap: true,
  },
})
