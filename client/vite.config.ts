import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API to Nest server for cookies
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/patients': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/staff': { target: 'http://localhost:4000', changeOrigin: true, secure: false },
      '/appointments': { target: 'http://localhost:4000', changeOrigin: true, secure: false },
      '/inventory': { target: 'http://localhost:4000', changeOrigin: true, secure: false },
      '/rooms': { target: 'http://localhost:4000', changeOrigin: true, secure: false },
      '/requirements': { target: 'http://localhost:4000', changeOrigin: true, secure: false }
    }
  }
})
