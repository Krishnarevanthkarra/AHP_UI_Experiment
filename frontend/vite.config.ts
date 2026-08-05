import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to FastAPI during `npm run dev` so the frontend
      // can just call fetch('/api/...') with no CORS juggling.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
