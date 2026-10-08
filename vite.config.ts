import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Le dossier public Vite est servi tel quel à la racine.
  // On utilise publicDir: 'public' (défaut) et on copie /content
  // via un plugin simple de copie.
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    // En dev, on sert aussi /content depuis la racine du projet
    fs: {
      allow: ['.'],
    },
  },
})
