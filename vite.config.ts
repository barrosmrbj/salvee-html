import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // o build vai para dentro do server/: o Express (Node.js App na Hostinger) serve o frontend
  // junto com a API, e o .htaccess da raiz serve a mesma pasta no site estático
  // dev: imagens enviadas têm URL relativa (/uploads/...) e ficam na API em :8000
  server: {
    proxy: {
      '/uploads': 'http://localhost:8000',
    },
  },
  build: {
    outDir: 'server/public',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
  },
})
