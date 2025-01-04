import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
})
