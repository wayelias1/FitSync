import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/signup': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/Login': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/user': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  }
})
