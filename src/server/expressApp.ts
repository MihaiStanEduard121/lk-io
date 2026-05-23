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

  appInstance = app;
  return app;
}
