// Force reload configuration for darkMode class strategy
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const httpsCertificatePath = path.resolve(__dirname, '../../.cert/hrm-dev.pfx')
const httpsEnabled = fs.existsSync(httpsCertificatePath)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    https: httpsEnabled ? {
      pfx: fs.readFileSync(httpsCertificatePath),
      passphrase: process.env.HRM_HTTPS_CERT_PASSWORD || 'hrm-dev-only',
    } : undefined,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'ws://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      // Helping Vite map dependencies
      'recharts': path.resolve(__dirname, '../../node_modules/recharts'),
      'lucide-react': path.resolve(__dirname, '../../node_modules/lucide-react')
    },
  },
  optimizeDeps: {
    include: ['recharts', 'lucide-react']
  }
})
