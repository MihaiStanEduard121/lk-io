import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Scraper Services ---
import { startCronJobs } from './src/server/cron.js';
import { initFirebaseBackend } from './src/server/firebaseAdmin.js';
import scraperRoutes from './src/server/api/scraperRoutes.js';
import presenceRoutes from './src/server/api/presenceRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Serve uploads if any
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    // Start background jobs
    startCronJobs();
  });
}

startServer().catch(console.error);
