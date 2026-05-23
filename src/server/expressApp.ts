import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initFirebaseBackend } from './firebaseAdmin.js';
import scraperRoutes from './api/scraperRoutes.js';
import presenceRoutes from './api/presenceRoutes.js';

let appInstance: any = null;

export function getExpressApp() {
  if (appInstance) return appInstance;

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Detailed Request Logger for API routes
  app.use((req, res, next) => {
    if (req.url && (req.url.startsWith('/api') || req.url.includes('presence') || req.url.includes('scraper'))) {
      console.log(`[Express API RootLogger] [${req.method}] URL: ${req.url} | originalUrl: ${req.originalUrl}`);
    }
    next();
  });

  // Init backend firebase connection
  initFirebaseBackend();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/scraper', scraperRoutes);
  app.use('/api/presence', presenceRoutes);

  // Serve uploads
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // Fallback for missing API routes to prevent Vite HTML hijack/index.html fallback
  app.use('/api/*', (req, res) => {
    console.warn(`[Express API Fallback] 404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, error: 'not_found', message: `API route not found: ${req.url}` });
  });

  appInstance = app;
  return app;
}
