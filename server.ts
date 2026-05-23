import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getExpressApp } from './src/server/expressApp.js';
import { startCronJobs } from './src/server/cron.js';

async function startServer() {
  const app = getExpressApp();
  const PORT = 3000;

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

