import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Custom plugin to inject our Express API routes during Vite development
function expressApiPlugin() {
  return {
    name: 'express-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/uploads'))) {
          console.log(`[Vite API Middleware] Intercepted request for: ${req.url}`);
          try {
            // Dynamically load expressApp.ts using Vite's SSR runtime
            const { getExpressApp } = await server.ssrLoadModule('./src/server/expressApp.ts');
            const app = getExpressApp();
            
            // Set correct originalUrl for Express routing if not present
            if (!req.originalUrl) {
              req.originalUrl = req.url;
            }
            
            app(req, res, (err: any) => {
              if (err) {
                console.error(`[Vite API Middleware] Express app error for ${req.url}:`, err);
                next(err);
              } else {
                console.warn(`[Vite API Middleware] Request for ${req.url} was NOT handled by Express API routes`);
                next();
              }
            });
          } catch (err) {
            console.error(`[Vite API Middleware] SSR loading error for ${req.url}:`, err);
            next(err);
          }
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
