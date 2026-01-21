import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // Changed to port 3000
    host: 'localhost', // Use localhost instead of IP
    strictPort: false  // Auto-find another port if busy
  }
})