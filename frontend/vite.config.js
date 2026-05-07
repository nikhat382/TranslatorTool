import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Optimize build output for production
    target: 'es2015',
    minify: 'esbuild', // Faster than terser

    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
        },
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Source maps only for debugging (disable for production)
    sourcemap: false,

    // Asset inlining threshold (inline small assets as base64)
    assetsInlineLimit: 4096, // 4KB

    // CSS code splitting
    cssCodeSplit: true,

    // Report compressed size
    reportCompressedSize: false, // Faster builds
  },

  server: {
    port: 3000,
    host: 'localhost',
    strictPort: false,

    // Faster HMR
    hmr: {
      overlay: true,
    },
  },

  // Optimize dependencies (pre-bundle for faster loading)
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: ['tesseract.js'], // Exclude heavy deps from pre-bundling
  },

  // Performance hints
  preview: {
    port: 3000,
  },
});