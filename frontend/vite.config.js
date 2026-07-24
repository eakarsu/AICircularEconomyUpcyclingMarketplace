import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendPort = process.env.BACKEND_PORT || 3001;
const frontendPort = process.env.FRONTEND_PORT || 4051;

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(frontendPort),
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
});
