import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Weakness-Calculator/',
  plugins: [react()],
  server: {
    proxy: {
      '/defend': 'http://localhost:8080',
      '/pokemon-detail': 'http://localhost:8080',
      '/pokemon': 'http://localhost:8080',
      '/team': 'http://localhost:8080',
    },
  },
})
