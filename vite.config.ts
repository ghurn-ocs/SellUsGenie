import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: false,
    rollupOptions: {
      input: {
        main: './index.html',
        'page-builder': './page-builder.html'
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom'],
          // UI Libraries
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-popover'
          ],
          // Router and State Management
          'router-state': ['wouter', 'zustand', '@tanstack/react-query'],
          // Charts and Analytics
          'charts': ['recharts'],
          // Form Management
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Payment and Auth
          'payments': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'supabase': ['@supabase/supabase-js'],
          // DnD and Page Builder
          'page-builder': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'dnd': ['react-dnd', 'react-dnd-html5-backend']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  }
})
