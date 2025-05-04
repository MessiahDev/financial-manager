import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    https: process.env.NODE_ENV === 'production' ? false : {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    }
  },
})