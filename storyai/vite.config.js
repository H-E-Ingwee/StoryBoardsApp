import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Load VITE_* env vars from repo root (.env.local, etc.)
  envDir: '..',
})
