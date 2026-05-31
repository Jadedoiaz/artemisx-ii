import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - always needed
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          // UI utilities
          'ui-utils': ['clsx', 'tailwind-merge', 'lucide-react'],
          // State management
          'state': ['zustand', '@tanstack/react-query'],
          // Solana - only when wallet connected
          'solana': ['@solana/web3.js', '@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui'],
          // Solana wallets - lazy loaded
          'solana-wallets': [
            '@solana/wallet-adapter-phantom',
            '@solana/wallet-adapter-solflare',
            '@solana/wallet-adapter-backpack',
            '@solana/wallet-adapter-wallets',
          ],
          // EVM - only when EVM tab selected
          'evm': ['wagmi', 'viem'],
          // Charts - only on Analytics page
          'charts': ['recharts'],
          // Notifications
          'notifications': ['react-hot-toast'],
          // Animation
          'animation': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
