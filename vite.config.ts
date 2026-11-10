import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Dev-only: proxies server-side so the browser never sees a
      // cross-origin request to api.tiketq.com (sidesteps a CORS quirk that
      // only affects localhost-origin testing against the prod API, not
      // real users on dashboard.tiketq.com). Only active when VITE_API_URL
      // is set to "/api" in a local .env — the committed default still
      // points straight at the real API.
      "/api": {
        target: "https://api.tiketq.com",
        changeOrigin: true,
      },
    },
  },
})
