import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initFirebaseBackend, getDb } from './firebaseAdmin.js';
import scraperRoutes from './api/scraperRoutes.js';
import presenceRoutes from './api/presenceRoutes.js';
import aiRoutes from './api/aiRoutes.js';
import mediaRoutes from './api/mediaRoutes.js';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

let appInstance: any = null;

export function getExpressApp() {
  if (appInstance) return appInstance;

  const app = express();
  
  // Security Headers Validation & Optimization
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for robust external TV players and streaming iframe integrations
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    referrerPolicy: false, // Let default referrers pass so players can verify the embedding host properly
    frameguard: false, // Allow embedding in AI Studio preview iframe
  }));

  // Custom Permissions-Policy and additional compliance headers
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    next();
  });
  app.use(compression());
  app.use(cors());
  app.use(express.json());

  // Global Rate Limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 800, // limit each IP to 800 requests per windowMs
    message: { success: false, error: 'Prea multe cereri, încercați din nou mai târziu.' }
  });
  app.use(limiter);

  // Dynamic Redirect Middleware
  app.use(async (req, res, next) => {
    // Only intercept page requests, ignore assets, static, and api
    if (req.method !== 'GET') return next();
    if (req.url.startsWith('/api') || req.url.startsWith('/assets') || req.url.includes('.')) return next();
    
    // Check redirects dynamically
    const dbInstance = getDb();
    if (dbInstance) {
       try {
         const q = query(collection(dbInstance, 'redirects'), where('sourcePath', '==', req.path), where('active', '==', true));
         const snapshot = await getDocs(q);
         if (!snapshot.empty) {
            const redirectConfig = snapshot.docs[0].data();
            console.log(`[Redirect] 301 ${req.path} -> ${redirectConfig.destinationPath}`);
            return res.redirect(301, redirectConfig.destinationPath);
         }
       } catch (e) {
         console.warn("Failed checking redirects: ", e);
       }
    }
    next();
  });

  // Detailed Request Logger for API routes
  app.use((req, res, next) => {
    if (req.url && (req.url.startsWith('/api') || req.url.includes('presence') || req.url.includes('scraper'))) {
      console.log(`[Express API RootLogger] [${req.method}] URL: ${req.url} | originalUrl: ${req.originalUrl}`);
    }
    next();
  });

  // Init backend firebase connection
  initFirebaseBackend();

  // SEO Routes
  app.get('/robots.txt', (req, res) => {
    const domain = `${req.protocol}://${req.get('host')}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /adminadmin/
Disallow: /api/

Sitemap: ${domain}/sitemap.xml`);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const domain = `${req.protocol}://${req.get('host')}`;
      const dbInstance = getDb();
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // 1. Static Pages
      const staticPages = ['', '/news', '/shows', '/schedule', '/search'];
      for (const p of staticPages) {
        xml += `  <url>\n    <loc>${domain}${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }

      // 1b. Legal Compliance Pages
      const legalPages = [
        '/legal?tab=termeni',
        '/legal?tab=privacy',
        '/legal?tab=cookie',
        '/legal?tab=dmca',
        '/legal?tab=disclaimer',
        '/legal?tab=aup',
        '/legal?tab=ads',
        '/legal?tab=contact'
      ];
      for (const p of legalPages) {
        const escapedUrl = `${domain}${p}`.replace(/&/g, '&amp;');
        xml += `  <url>\n    <loc>${escapedUrl}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      }

      // 2. Dynamic Live Programs (Channels)
      if (dbInstance) {
        try {
          const snapshotPrograms = await getDocs(collection(dbInstance, 'programs'));
          for (const docSnap of snapshotPrograms.docs) {
            const id = docSnap.id;
            xml += `  <url>\n    <loc>${domain}/play/${id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
          }
        } catch (e) {
          console.error("Error reading programs for sitemap:", e);
        }

        // 3. Dynamic News Articles
        try {
          const snapshotArticles = await getDocs(collection(dbInstance, 'articles'));
          for (const docSnap of snapshotArticles.docs) {
            const data = docSnap.data();
            const slug = data.slug || docSnap.id;
            xml += `  <url>\n    <loc>${domain}/news/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
          }
        } catch (e) {
          console.error("Error reading articles for sitemap:", e);
        }

        // 4. Dynamic TV Shows
        try {
          const snapshotShows = await getDocs(collection(dbInstance, 'shows'));
          for (const docSnap of snapshotShows.docs) {
            const data = docSnap.data();
            const slug = data.slug || docSnap.id;
            xml += `  <url>\n    <loc>${domain}/shows/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
          }
        } catch (e) {
          console.error("Error reading shows for sitemap:", e);
        }
      }

      xml += `</urlset>`;
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (err: any) {
      console.error("Sitemap generation failed:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/test-direct', (req, res) => {
    res.json({ success: true, message: 'Direct route works!' });
  });

  app.use('/api/scraper', scraperRoutes);
  app.use('/api/presence', presenceRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/media', mediaRoutes);

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
