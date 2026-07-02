import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      nodePolyfills({
        protocolImports: true,
      }),
    ],
    define: {
      global: 'globalThis',
    },
    server: {
      port: 5173,
      // Proxy is only used in local dev (when VITE_BACKEND_URL is not set)
      proxy: env.VITE_BACKEND_URL ? {} : {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    },
  };
});
