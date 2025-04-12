import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import fs from "fs"

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    https:{
      key: fs.readFileSync(`../private.key`),
      cert: fs.readFileSync(`../certificate.crt`),
    },
    port: 443
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})