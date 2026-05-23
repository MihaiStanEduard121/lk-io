import { Router } from 'express';
import { runArticleScraper } from '../scraperService.js';
import { updateCronConfig } from '../cron.js';
import { getDb } from '../firebaseAdmin.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const router = Router();

router.post('/run', async (req, res) => {
  try {
    const { targetUrl, force } = req.body || {};
    const result = await runArticleScraper({ 
      targetUrl, 
      force: force !== undefined ? force : true 
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/config', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ success: false, message: 'DB not initialized' });

  const { active, targetUrl, intervalStr } = req.body;
  const ref = doc(db, 'settings', 'scraper');
  
  await setDoc(ref, {
    active,
    targetUrl,
    intervalStr: intervalStr || '*/5 * * * *',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  updateCronConfig(active, intervalStr || '*/5 * * * *');

  res.json({ success: true });
});

router.get('/config', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ success: false, message: 'DB not initialized' });

  const ref = doc(db, 'settings', 'scraper');
  const d = await getDoc(ref);
  if (d.exists()) {
    res.json(d.data());
  } else {
    res.json({ active: false, targetUrl: '', intervalStr: '*/5 * * * *' });
  }
});

export default router;
