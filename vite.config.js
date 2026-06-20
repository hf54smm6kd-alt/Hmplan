import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single-page personal training app. Built to a relative base so it can be
// served from any static host (GitHub Pages subpaths included).
export default defineConfig({
  plugins: [react()],
  base: './',
})
