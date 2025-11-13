import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API to Nest server for cookies
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/patients': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/staff': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/appointments': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/inventory': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/rooms': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/requirements': { target: 'http://localhost:3000', changeOrigin: true, secure: false }
    }
  }
})
