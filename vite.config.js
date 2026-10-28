import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(process.env.PORT || env.PORT || 3000)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT musi być liczbą całkowitą od 1 do 65535.')
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { host: '0.0.0.0', port, strictPort: true },
    preview: { host: '0.0.0.0', port, strictPort: true },
  }
})
