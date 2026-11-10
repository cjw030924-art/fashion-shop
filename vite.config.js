import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base: './' → GitHub Pages(…github.io/fashion-shop/)에서도 경로가 맞게
export default defineConfig({
  base: './',
  plugins: [react()],
})
