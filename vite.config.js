import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174,       // dev server (default 5173)
    strictPort: true, // fail if 5174 is taken instead of auto-increment
    // host: '0.0.0.0' // uncomment to expose on your LAN/Docker
  },
  preview: {
    port: 4174,       // preview server (default 4173)
    strictPort: true
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
