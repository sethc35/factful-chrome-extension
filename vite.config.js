import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        gdocs: 'src/executables/gdocs-main.js',
        backend: 'src/utils/Backend.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
    emptyOutDir: false,
  }
})
