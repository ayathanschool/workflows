import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables so VITE_GAS_WEB_APP_URL is available here
  const env = loadEnv(mode, process.cwd(), '');
  const gasTarget = env.VITE_GAS_WEB_APP_URL || 'https://script.google.com';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      // Proxy API calls to the Google Apps Script URL during development to avoid CORS
      proxy: {
        '/gas': (() => {
          try {
            console.log('Configuring proxy for:', gasTarget);
            const u = new URL(gasTarget);
            const origin = u.origin;
            const fullPath = u.pathname; // Keep full path including /exec
            return {
              target: origin,
              changeOrigin: true,
              secure: true,
              configure: (proxy, options) => {
                proxy.on('error', (err, req, res) => {
                  console.log('Proxy error:', err);
                });
                proxy.on('proxyReq', (proxyReq, req, res) => {
                  console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
                });
              },
              // rewrite /gas... -> /macros/s/.../exec...
              rewrite: (path) => {
                const newPath = path.replace(/^\/gas/, fullPath);
                console.log('Rewriting:', path, '->', newPath);
                return newPath;
              }
            };
          } catch (err) {
            console.error('Error configuring proxy:', err);
            return {
              target: gasTarget,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/gas/, '')
            };
          }
        })()
      }
    }
  }
})
