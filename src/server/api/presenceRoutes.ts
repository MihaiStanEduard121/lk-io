import { Router } from 'express';

const router = Router();

interface ActiveSession {
  clientId: string;
  page: string;
  isAdmin: boolean;
  lastPing: number;
}

// In-Memory map to track presence
const activeSessions = new Map<string, ActiveSession>();

// Cleanup stale sessions (older than 30 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [clientId, session] of activeSessions.entries()) {
    if (now - session.lastPing > 30000) {
      activeSessions.delete(clientId);
    }
  }
}, 10000);

router.post('/ping', (req, res) => {
  const { clientId, page, isAdmin } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'clientId is required' });
  }

  activeSessions.set(clientId, {
    clientId,
    page: page || '/',
    isAdmin: !!isAdmin,
    lastPing: Date.now()
  });

  res.json({ success: true });
});

router.get('/stats', (req, res) => {
  // Clear stale sessions first to be accurate
  const now = Date.now();
  for (const [clientId, session] of activeSessions.entries()) {
    if (now - session.lastPing > 30000) {
      activeSessions.delete(clientId);
    }
  }

  const sessions = Array.from(activeSessions.values());
  const totalLive = sessions.length;
  const adminLive = sessions.filter(s => s.isAdmin).length;
  const publicLive = totalLive - adminLive;

  // Group by page URL
  const pageStats: Record<string, number> = {};
  sessions.forEach(s => {
    pageStats[s.page] = (pageStats[s.page] || 0) + 1;
  });

  res.json({
    totalLive,
    adminLive,
    publicLive,
    pageStats,
    sessions: sessions.map(s => ({
      clientId: s.clientId,
      page: s.page,
      isAdmin: s.isAdmin,
      secondsAgo: Math.max(0, Math.round((now - s.lastPing) / 1000))
    }))
  });
});

export default router;
