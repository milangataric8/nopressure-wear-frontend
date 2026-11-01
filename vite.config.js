import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Keep local OAuth callbacks and emailed links on the configured frontend port.
  server: { port: 5173, strictPort: true },
  plugins: [
    react(),
    tailwindcss(),
  ],
})