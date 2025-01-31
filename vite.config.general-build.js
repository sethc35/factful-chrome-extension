import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        'extension-main': 'src/executables/general/extension-main.js',
        'backend': 'src/utils/Backend.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
    emptyOutDir: false,
  }
})
