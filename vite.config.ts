/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.CI ? '/dawg/' : '/',
  test: {
    globals: true,
    environment: 'happy-dom',
    exclude: ['node_modules/*', 'e2e/*'],
    reporters: process.env.CI ? 'junit' : 'default',
    outputFile: process.env.CI ? './test-results/unit-results.xml' : ''
  },
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
