import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 3000,
  },
  resolve: {
    alias: {
      "@axios": path.resolve(__dirname, "./src/axios.js"),
      "@MainStyle": path.resolve(__dirname, "./src/MainStyle.css"), // Corrected the alias name
    },
  },
});
