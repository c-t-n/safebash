import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

// Serve raw script content when /scripts/:id is hit by a non-HTML client (e.g. curl).
// Browsers send `Accept: text/html,...` → fall through to the SPA.
const rawScriptPlugin: Plugin = {
  name: 'safebash:raw-script-for-curl',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url ?? '';
      const match = url.match(/^\/scripts\/([^/?#]+)\/?(?:\?.*)?$/);
      if (!match) return next();

      const id = match[1];
      // Reserved SPA routes that share the /scripts/* prefix
      if (id === 'new') return next();

      const accept = (req.headers.accept ?? '').toLowerCase();
      if (accept.includes('text/html')) return next();

      try {
        const upstream = await fetch(`${BACKEND_URL}/api/scripts/${id}/raw`);
        const body = await upstream.text();
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(body);
      } catch {
        res.statusCode = 502;
        res.end('upstream error\n');
      }
    });
  },
};

export default defineConfig({
  plugins: [react(), rawScriptPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
});
