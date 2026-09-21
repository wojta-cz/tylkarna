import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA support (manifest + service worker) is hand-rolled in /public rather than
// via a plugin, so it works identically in dev and in the production build.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
