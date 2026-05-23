import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET || 'dev_secret';
const DATA_FILE = path.join(process.cwd(), 'data.json');
const ARTICLES_FILE = path.join(process.cwd(), 'articles.json');
const CATEGORIES_FILE = path.join(process.cwd(), 'categories.json');
const COMMENTS_FILE = path.join(process.cwd(), 'comments.json');
const SCHEDULE_FILE = path.join(process.cwd(), 'schedule.json');
const HOMEPAGE_FILE = path.join(process.cwd(), 'homepage.json');
const SHOWS_FILE = path.join(process.cwd(), 'shows.json');
const EPISODES_FILE = path.join(process.cwd(), 'episodes.json');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads dir
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer conf
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper funcs for files
const readJson = async (file: string) => {
  if (!existsSync(file)) return [];
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw);
};
const writeJson = async (file: string, data: any) => fs.writeFile(file, JSON.stringify(data, null, 2));

const readData = () => readJson(DATA_FILE);
const writeData = (data: any) => writeJson(DATA_FILE, data);

const readArticles = () => readJson(ARTICLES_FILE);
const writeArticles = (data: any) => writeJson(ARTICLES_FILE, data);

const readCategories = () => readJson(CATEGORIES_FILE);
const writeCategories = (data: any) => writeJson(CATEGORIES_FILE, data);

const readComments = () => readJson(COMMENTS_FILE);
const writeComments = (data: any) => writeJson(COMMENTS_FILE, data);

const readSchedule = () => readJson(SCHEDULE_FILE);
const writeSchedule = (data: any) => writeJson(SCHEDULE_FILE, data);

const readHomepage = () => readJson(HOMEPAGE_FILE);
const writeHomepage = (data: any) => writeJson(HOMEPAGE_FILE, data);

const readShows = () => readJson(SHOWS_FILE);
const writeShows = (data: any) => writeJson(SHOWS_FILE, data);

const readEpisodes = () => readJson(EPISODES_FILE);
const writeEpisodes = (data: any) => writeJson(EPISODES_FILE, data);

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// API ROUTES
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  // Default admin for demo
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ user: 'admin' }, SECRET, { expiresIn: '24h' });
    res.json({ token });
    return;
  }
  res.status(401).json({ error: 'Credențiale invalide.' });
});

app.get('/api/programs', async (req, res) => {
  const data = await readData();
  res.json(data);
});

app.get('/api/programs/:id', async (req, res) => {
  const data = await readData();
  const prog = data.find((p: any) => p.id === req.params.id);
  if (prog) res.json(prog);
  else res.status(404).json({ error: 'Not found' });
});

app.post('/api/programs', authMiddleware, async (req, res) => {
  const data = await readData();
  const newProg = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
  data.push(newProg);
  await writeData(data);
  res.json(newProg);
});

app.put('/api/programs/:id', authMiddleware, async (req, res) => {
  const data = await readData();
  const index = data.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  data[index] = { ...data[index], ...req.body };
  await writeData(data);
  res.json(data[index]);
});

app.delete('/api/programs/:id', authMiddleware, async (req, res) => {
  let data = await readData();
  data = data.filter((p: any) => p.id !== req.params.id);
  await writeData(data);
  res.json({ success: true });
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  const data = await readData();
  const stats = {
    totalPrograms: data.length,
    totalViews: data.reduce((acc: number, cur: any) => acc + (cur.views || 0), 0),
    onlinePrograms: data.filter((p: any) => p.status === 'online').length,
    categories: data.reduce((acc: any, cur: any) => {
      acc[cur.category] = (acc[cur.category] || 0) + 1;
      return acc;
    }, {})
  };
  res.json(stats);
});

app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Search Route
app.get('/api/search', async (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();
  const articles = await readArticles();
  const shows = await readShows();
  const episodes = await readEpisodes();
  const live = await readData();
  
  res.json({
    articles: articles.filter((a: any) => a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query)),
    shows: shows.filter((s: any) => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)),
    episodes: episodes.filter((e: any) => e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query)),
    live: live.filter((l: any) => l.title.toLowerCase().includes(query) || l.description.toLowerCase().includes(query))
  });
});

// Categories Routes
app.get('/api/categories', async (req, res) => res.json(await readCategories()));
app.post('/api/categories', authMiddleware, async (req, res) => {
  const data = await readCategories();
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newObj = { ...req.body, id: Date.now().toString(), slug };
  data.push(newObj); await writeCategories(data); res.json(newObj);
});
app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  let data = await readCategories();
  data = data.filter((p: any) => p.id !== req.params.id);
  await writeCategories(data); res.json({ success: true });
});

// Comments Routes
app.get('/api/comments', async (req, res) => res.json(await readComments()));
app.post('/api/comments', async (req, res) => {
  const data = await readComments();
  const newObj = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString(), approved: false };
  data.push(newObj); await writeComments(data); res.json(newObj);
});
app.put('/api/comments/:id/approve', authMiddleware, async (req, res) => {
  const data = await readComments();
  const index = data.findIndex((p: any) => p.id === req.params.id);
  if (index > -1) {
    data[index] = { ...data[index], approved: true };
    await writeComments(data); res.json(data[index]);
  } else res.status(404).json({ error: 'Not found' });
});
app.delete('/api/comments/:id', authMiddleware, async (req, res) => {
  let data = await readComments();
  data = data.filter((p: any) => p.id !== req.params.id);
  await writeComments(data); res.json({ success: true });
});

// TV Schedule Routes
app.get('/api/schedule', async (req, res) => res.json(await readSchedule()));
app.post('/api/schedule', authMiddleware, async (req, res) => {
  const data = await readSchedule();
  const newObj = { ...req.body, id: Date.now().toString() };
  data.push(newObj); await writeSchedule(data); res.json(newObj);
});
app.delete('/api/schedule/:id', authMiddleware, async (req, res) => {
  let data = await readSchedule();
  data = data.filter((p: any) => p.id !== req.params.id);
  await writeSchedule(data); res.json({ success: true });
});

// Homepage Config Route
app.get('/api/homepage', async (req, res) => {
  const data = await readHomepage();
  res.json(data && Object.keys(data).length ? data : {
    heroTitle: "Bine ai venit pe StreamTV",
    heroSubtitle: "Urmărește cele mai bune emisiuni și transmisiuni live.",
    heroBackgroundImage: ""
  });
});
app.put('/api/homepage', authMiddleware, async (req, res) => {
  await writeHomepage(req.body);
  res.json(req.body);
});

// Articles Routes
app.get('/api/articles', async (req, res) => res.json(await readArticles()));
app.get('/api/articles/:identifier', async (req, res) => {
  const data = await readArticles();
  const index = data.findIndex((p: any) => p.id === req.params.identifier || p.slug === req.params.identifier);
  if (index > -1) {
    // Increment views
    data[index].views = (data[index].views || 0) + 1;
    await writeArticles(data);
    res.json(data[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.post('/api/articles', authMiddleware, async (req, res) => {
  const data = await readArticles();
  const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newObj = { ...req.body, id: Date.now().toString(), slug, createdAt: new Date().toISOString() };
  data.push(newObj); await writeArticles(data); res.json(newObj);
});
app.put('/api/articles/:id', authMiddleware, async (req, res) => {
  const data = await readArticles();
  const index = data.findIndex((p: any) => p.id === req.params.id);
  if (index > -1) {
    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    data[index] = { ...data[index], ...req.body, slug };
    await writeArticles(data); res.json(data[index]);
  } else res.status(404).json({ error: 'Not found' });
});
app.delete('/api/articles/:id', authMiddleware, async (req, res) => {
  let data = await readArticles();
  data = data.filter((p: any) => p.id !== req.params.id);
  await writeArticles(data); res.json({ success: true });
});

// Shows Routes
app.get('/api/shows', async (req, res) => res.json(await readShows()));
app.get('/api/shows/:identifier', async (req, res) => {
  const data = await readShows();
  const art = data.find((p: any) => p.id === req.params.identifier || p.slug === req.params.identifier);
  if (art) res.json(art); else res.status(404).json({ error: 'Not found' });
});
app.post('/api/shows', authMiddleware, async (req, res) => {
  const data = await readShows();
  const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newObj = { ...req.body, id: Date.now().toString(), slug, createdAt: new Date().toISOString() };
  data.push(newObj); await writeShows(data); res.json(newObj);
});
app.put('/api/shows/:id', authMiddleware, async (req, res) => {
  const data = await readShows();
  const index = data.findIndex((p: any) => p.id === req.params.id);
  if (index > -1) {
    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    data[index] = { ...data[index], ...req.body, slug };
    await writeShows(data); res.json(data[index]);
  } else res.status(404).json({ error: 'Not found' });
});
app.delete('/api/shows/:id', authMiddleware, async (req, res) => {
  let data = await readShows();
  data = data.filter((p: any) => p.id !== req.params.id);
  await writeShows(data); res.json({ success: true });
});

// Episodes Routes
app.get('/api/shows/:showId/episodes', async (req, res) => {
  const data = await readEpisodes();
  res.json(data.filter((e: any) => e.showId === req.params.showId));
});
app.get('/api/episodes/:id', async (req, res) => {
  const data = await readEpisodes();
  const ep = data.find((p: any) => p.id === req.params.id);
  if (ep) res.json(ep); else res.status(404).json({ error: 'Not found' });
});
app.post('/api/shows/:showId/episodes', authMiddleware, async (req, res) => {
  const data = await readEpisodes();
  const newObj = { ...req.body, id: Date.now().toString(), showId: req.params.showId, createdAt: new Date().toISOString() };
  data.push(newObj); await writeEpisodes(data); res.json(newObj);
});
app.put('/api/episodes/:id', authMiddleware, async (req, res) => {
  const data = await readEpisodes();
  const index = data.findIndex((p: any) => p.id === req.params.id);
  if (index > -1) {
    data[index] = { ...data[index], ...req.body };
    await writeEpisodes(data); res.json(data[index]);
  } else res.status(404).json({ error: 'Not found' });
});
app.delete('/api/episodes/:id', authMiddleware, async (req, res) => {
  let data = await readEpisodes();
  data = data.filter((p: any) => p.id !== req.params.id);
  await writeEpisodes(data); res.json({ success: true });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
