import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const HTTPS_ENABLED = process.env.HTTPS_ENABLED === "true"

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    ...(HTTPS_ENABLED && {
      https: {
        key: fs.readFileSync(`../private.key`),
        cert: fs.readFileSync(`../certificate.crt`),
      },
      port: 443,
    }),
    ...(!HTTPS_ENABLED && {
      port: 3000,
    })
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})