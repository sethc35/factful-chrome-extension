import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        'gdocs-main': 'src/executables/gdocs/gdocs-entrypoint.js',
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife'
      }
    },
    emptyOutDir: false,
  }
})
