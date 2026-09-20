import { Router } from 'express';
import { epgService } from '../epgService.js';

const router = Router();

// GET /api/epg/live - Now & Next on all channels
router.get('/live', (req, res) => {
  try {
    const channelsParam = req.query.channels as string;
    const channelIds = channelsParam ? channelsParam.split(',').map(s => s.trim()) : undefined;
    const liveData = epgService.getLiveChannels(channelIds);
    res.json({ success: true, data: liveData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/epg/channel/:id - Full day schedule for channel
router.get('/channel/:id', (req, res) => {
  try {
    const { id } = req.params;
    const date = req.query.date as string;
    const schedule = epgService.getChannelSchedule(id, date);
    res.json({ success: true, channelId: id, date: date || new Date().toISOString().split('T')[0], schedule });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/epg/schedule - Multi-channel guide
router.get('/schedule', (req, res) => {
  try {
    const date = req.query.date as string;
    const channelId = req.query.channel as string;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 500;

    const items = epgService.querySchedule({
      date,
      channelId,
      category,
      search,
      limit
    });

    res.json({ success: true, count: items.length, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/epg/upcoming - Upcoming programs
router.get('/upcoming', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
    const upcoming = epgService.getUpcomingShows(limit);
    res.json({ success: true, upcoming });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/epg/search - Search shows
router.get('/search', (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const results = epgService.searchPrograms(q);
    res.json({ success: true, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/epg/admin/status - EPG sync status & stats
router.get('/admin/status', (req, res) => {
  try {
    const status = epgService.getStatus();
    const mappings = epgService.getChannelMappings();
    const providerChannels = epgService.getProviderChannelsList();
    res.json({ success: true, status, mappings, providerChannels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/epg/admin/sync - Manual Sync Trigger
router.post('/admin/sync', async (req, res) => {
  try {
    const force = req.body?.force === true;
    const result = await epgService.syncEPG(force);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/epg/admin/mapping - Save channel mappings
router.post('/admin/mapping', (req, res) => {
  try {
    const { mappings } = req.body;
    if (!mappings || typeof mappings !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid mappings object' });
    }
    epgService.setChannelMappings(mappings);
    res.json({ success: true, message: 'Mapările au fost salvate cu succes!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/epg/admin/artwork-override - Custom image override
router.post('/admin/artwork-override', (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, error: 'Titlul și URL-ul imaginii sunt obligatorii' });
    }
    epgService.setArtworkOverride(title, imageUrl);
    res.json({ success: true, message: `Artwork actualizat pentru "${title}"` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
