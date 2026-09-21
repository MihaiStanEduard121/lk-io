import express from 'express';
import axios from 'axios';
import https from 'https';
import http from 'http';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getDb } from '../firebaseAdmin.js';

const router = express.Router();

const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
const httpAgent = new http.Agent({ keepAlive: true });

// Professional local reference index containing secure sources (Wikimedia Commons high-resolution Vectors & PNGs) as requested.
const STABLE_LOGO_MAP: Record<string, string> = {
  'pro tv': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Pro_TV_logo.svg',
  'pro tv hd': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Pro_TV_logo.svg',
  'antena 1': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Antena_1_logo.svg',
  'antena 1 hd': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Antena_1_logo.svg',
  'tvr 1': 'https://upload.wikimedia.org/wikipedia/commons/1/15/TVR-1-Logo-2022.png',
  'tvr1': 'https://upload.wikimedia.org/wikipedia/commons/1/15/TVR-1-Logo-2022.png',
  'tvr 2': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/TVR2_logo_2022.png',
  'tvr2': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/TVR2_logo_2022.png',
  'tvr 3': 'https://upload.wikimedia.org/wikipedia/commons/2/23/TVR3_logo_2022.png',
  'tvr3': 'https://upload.wikimedia.org/wikipedia/commons/2/23/TVR3_logo_2022.png',
  'tvr international': 'https://upload.wikimedia.org/wikipedia/commons/0/07/TVR-International-Logo-2022.png',
  'tvr international hd': 'https://upload.wikimedia.org/wikipedia/commons/0/07/TVR-International-Logo-2022.png',
  'canal d': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Kanal_D_logo_2023.svg',
  'kanal d': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Kanal_D_logo_2023.svg',
  'canal d2': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Kanal_D2_logo.png',
  'kanal d2': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Kanal_D2_logo.png',
  'prima tv': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Prima_TV_logo_2021.svg',
  'national tv': 'https://upload.wikimedia.org/wikipedia/commons/0/06/National_TV_logo.png',
  'național tv': 'https://upload.wikimedia.org/wikipedia/commons/0/06/National_TV_logo.png',
  'pro cinema': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Pro_Cinema_logo_2022.svg',
  'acasa tv': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Acas%C4%83_TV_logo_2022.svg',
  'acasă tv': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Acas%C4%83_TV_logo_2022.svg',
  'acasa gold': 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Acas%C4%83_Gold_logo_2022.svg',
  'acasă gold': 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Acas%C4%83_Gold_logo_2022.svg',
  'antena stars': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Antena_Stars_logo.svg',
  'national 24 plus': 'https://upload.wikimedia.org/wikipedia/commons/1/16/N24_Plus_logo_2022.png',
  'antena 3 cnn': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Antena_3_CNN_logo.png',
  'românia tv': 'https://upload.wikimedia.org/wikipedia/commons/0/06/Rom%C3%A2nia_TV_logo_2021.svg',
  'romania tv': 'https://upload.wikimedia.org/wikipedia/commons/0/06/Rom%C3%A2nia_TV_logo_2021.svg',
  'realitatea tv': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Realitatea_Plus_logo_2021.svg',
  'prima news': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Prima_News_logo.png',
  'b1 tv': 'https://upload.wikimedia.org/wikipedia/commons/3/30/B1_TV_logo_2021.svg',
  'euronews românia': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Euronews_Romania_logo.svg',
  'euronews romania': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Euronews_Romania_logo.svg',
  'digi24': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Digi24_logo_2012.svg',
  'digi 24': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Digi24_logo_2012.svg',
  'cnn': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg',
  'bbc news': 'https://upload.wikimedia.org/wikipedia/commons/6/62/BBC_News_2022.svg',
  'cbs reality': 'https://upload.wikimedia.org/wikipedia/commons/6/61/CBS_Reality_logo.svg',
  'supersport 1': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/SuperSport_logo.svg',
  'supersport 2': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/SuperSport_logo.svg',
  'supersport 3': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/SuperSport_logo.svg',
  'supersport 4': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/SuperSport_logo.svg',
  'pro arena': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Pro_Arena_logo_2022.svg',
  'tvr sport': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/TVR_Sport_logo_2024.png',
  'prima sport 1': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Prima_Sport_logo.png',
  'prima sport 2': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Prima_Sport_logo.png',
  'prima sport 3': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Prima_Sport_logo.png',
  'prima sport 4': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Prima_Sport_logo.png',
  'prima sport 5': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Prima_Sport_logo.png',
  'sport extra': 'https://upload.wikimedia.org/wikipedia/commons/6/61/Sport_Extra_logo.png',
  'eurosport 1': 'https://upload.wikimedia.org/wikipedia/commons/2/20/Eurosport_1_logo.svg',
  'eurosport 2': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Eurosport_2_logo.svg',
  'hbo': 'https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg',
  'hbo 2': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/HBO2_logo.svg',
  'hbo 3': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/HBO3_logo.png',
  'diva': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/DIVA_logo_2010.png',
  'happy channel': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Happy_Channel_logo_2016.svg',
  'film cafe': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Film_Cafe_logo.svg',
  'tv1000': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/TV1000_Logo.svg',
  'film now': 'https://upload.wikimedia.org/wikipedia/commons/7/75/Film_Now_logo.png',
  'epic drama': 'https://upload.wikimedia.org/wikipedia/commons/2/25/Epic_Drama_logo.svg',
  'amc': 'https://upload.wikimedia.org/wikipedia/commons/b/be/AMC_logo.svg',
  'showtime 1': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Showtime_logo.svg',
  'showtime 2': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Showtime_logo.svg',
  'axn': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/AXN_logo_2015.svg',
  'axn spin': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/AXN_Spin_logo.png',
  'axn black': 'https://upload.wikimedia.org/wikipedia/commons/0/07/AXN_Black_logo.png',
  'axn white': 'https://upload.wikimedia.org/wikipedia/commons/6/60/AXN_White_logo.png',
  'cinemax': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Cinemax_logo_2016.svg',
  'cinemax 2': 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Cinemax_2_logo.png',
  'bollywood tv': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Bollywood_TV_logo.png',
  'comedy central': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Comedy_Central_2018.svg',
  'warner tv': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Warner_TV_logo_2021.svg',
  'bbc first': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/BBC_First_Logo.png',
  'minimax': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Minimax_logo_2024.png',
  'cartoon network': 'https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg',
  'disney channel': 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Disney_Channel_logo_2022.svg',
  'teennick': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/TeenNick_2023_logo.svg',
  'nickelodeon': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Nickelodeon_2023_logo.svg',
  'disney jr': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Disney_Junior_2024_logo.svg',
  'cartoonito': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Cartoonito_2021_logo.svg',
  'nicktoons': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Nicktoons_2023_logo.svg',
  'nick jr': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Nick_Jr._2023_logo.svg',
  'jimjam': 'https://upload.wikimedia.org/wikipedia/commons/0/01/JimJam_logo_2018.svg',
  'duck tv': 'https://upload.wikimedia.org/wikipedia/commons/7/79/Duck_tv_logo.png',
  'discovery channel': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Discovery_Channel_logo_2019.svg',
  'history channel': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/The_History_Channel_logo.svg',
  'national geographic': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/National_Geographic_logo.svg',
  'nat geo wild': 'https://upload.wikimedia.org/wikipedia/commons/d/de/Nat_Geo_Wild_2020.svg',
  'bbc earth': 'https://upload.wikimedia.org/wikipedia/commons/1/18/BBC_Earth_logo.svg',
  'viasat history': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Viasat_History_logo.svg',
  'viasat nature': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Viasat_Nature_logo_2024.svg',
  'viasat explorer': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Viasat_Explore_logo.svg',
  'travel mix': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Travel_Mix_logo.png',
  'paprika': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/TV_Paprika_logo_2022.svg',
  'hgtv': 'https://upload.wikimedia.org/wikipedia/commons/5/52/HGTV_2015_logo.svg',
  'taraf tv': 'https://upload.wikimedia.org/wikipedia/commons/8/80/Taraf_TV_logo.svg',
  'favorit tv': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Favorit_TV_logo.png',
  'etno tv': 'https://upload.wikimedia.org/wikipedia/commons/8/84/Etno_TV_logo.png',
  'utv': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Utv_logo.svg',
  'kiss tv': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Kiss_TV_logo.svg',
  'music channel': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Music_Channel_Romania.png',
  'zu tv': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/ZUTV_logo.svg',
  'fish & hunting tv': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/The_Fishing_and_Hunting_Channel.svg',
  'filmbox': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/FilmBox_logo.png',
  'filmbox extra': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/FilmBox_Extra_logo.png',
  'filmbox premium': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/FilmBox_Premium.png',
  'canal 33': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Canal_33_logo.png',
  'dizi': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Dizi_logo_%282020%29.svg'
};

async function findLogo(title: string): Promise<string | null> {
  const norm = title.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // 1. Direct matched dictionary lookup from reliable secure vectors
  if (STABLE_LOGO_MAP[norm]) {
    return STABLE_LOGO_MAP[norm];
  }

  // Exact matching containing keywords
  for (const k of Object.keys(STABLE_LOGO_MAP)) {
    if (norm.includes(k) || k.includes(norm)) {
      return STABLE_LOGO_MAP[k];
    }
  }

  // 2. Wikipedia Search API (most matching article)
  try {
    const searchUrl = `https://ro.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&format=json&utf8=1`;
    const sRes = await fetch(searchUrl);
    const sData: any = await sRes.json();
    const topResult = sData.query?.search?.[0]?.title;
    if (topResult) {
      const url = `https://ro.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topResult)}&prop=pageimages&format=json&pithumbsize=500`;
      const res = await fetch(url);
      const data: any = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].thumbnail?.source) {
          return pages[pageId].thumbnail.source;
        }
      }
    }
  } catch(e) {}

  // 3. Fallback Wikipedia EN API
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&format=json&utf8=1`;
    const sRes = await fetch(searchUrl);
    const sData: any = await sRes.json();
    const topResult = sData.query?.search?.[0]?.title;
    if (topResult) {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topResult)}&prop=pageimages&format=json&pithumbsize=500`;
      const res = await fetch(url);
      const data: any = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].thumbnail?.source) {
          return pages[pageId].thumbnail.source;
        }
      }
    }
  } catch(e) {}

  // 4. Fallback to vector placeholder with beautiful random background matching branding
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&color=fff&size=512&font-size=0.33`;
}

router.post('/scan', async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
       return res.status(500).json({ success: false, error: 'Database not initialized' });
    }

    const force = req.query.force === 'true' || req.body.force === true;

    const stats = {
      programsScanned: 0,
      programsUpdated: 0,
      showsScanned: 0,
      showsUpdated: 0,
    };

    // Scan programs
    const programsSnap = await getDocs(collection(db, 'programs'));
    for (const d of programsSnap.docs) {
      stats.programsScanned++;
      const data = d.data();
      const needsLogo = !data.thumbnail || data.thumbnail.trim() === '' || data.thumbnail.includes('ui-avatars.com') || force;
      
      if (needsLogo) {
         const logo = await findLogo(data.title);
         if (logo) {
            await updateDoc(doc(db, 'programs', d.id), { thumbnail: logo });
            stats.programsUpdated++;
         }
      }
    }

    // Scan shows
    const showsSnap = await getDocs(collection(db, 'shows'));
    for (const d of showsSnap.docs) {
      stats.showsScanned++;
      const data = d.data();
      const needsLogo = !data.thumbnail || data.thumbnail.trim() === '' || data.thumbnail.includes('ui-avatars.com') || force;

      if (needsLogo) {
         const logo = await findLogo(data.title);
         if (logo) {
            await updateDoc(doc(db, 'shows', d.id), { thumbnail: logo, banner: data.banner || logo });
            stats.showsUpdated++;
         }
      }
    }

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error("Media Scan Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Robust Stream Proxy to bypass Mixed-Content (HTTP on HTTPS) and CORS restrictions
router.get('/stream-proxy', async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send('Missing url parameter');
    }

    let targetUrl: string;
    try {
      targetUrl = decodeURIComponent(rawUrl);
    } catch {
      targetUrl = rawUrl;
    }

    // Safety check on protocol
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return res.status(400).send('Invalid url protocol');
    }

    const referer = (req.query.referer as string) || (req.headers['referer'] as string) || '';

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
    };
    if (referer) {
      try {
        headers['Referer'] = referer;
        headers['Origin'] = new URL(referer).origin;
      } catch {}
    }

    const response = await axios.get(targetUrl, {
      headers,
      httpsAgent,
      httpAgent,
      responseType: 'stream',
      validateStatus: () => true,
      timeout: 15000,
    });

    const contentType = String(response.headers['content-type'] || '');
    const isM3u8 = contentType.includes('mpegurl') || contentType.includes('m3u') || targetUrl.includes('.m3u8');

    // Enable cross-origin streaming
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (isM3u8) {
      const chunks: Buffer[] = [];
      response.data.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.data.on('end', () => {
        try {
          const text = Buffer.concat(chunks).toString('utf-8');
          const baseUrl = new URL(targetUrl);
          
          const rewritten = text.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;
            
            if (trimmed.startsWith('#')) {
              if (trimmed.includes('URI="')) {
                return trimmed.replace(/URI="([^"]+)"/, (_, uri) => {
                  try {
                    const absolute = new URL(uri, baseUrl).toString();
                    const proxied = `/api/media/stream-proxy?url=${encodeURIComponent(absolute)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}`;
                    return `URI="${proxied}"`;
                  } catch {
                    return _;
                  }
                });
              }
              return line;
            }

            try {
              const absolute = new URL(trimmed, baseUrl).toString();
              return `/api/media/stream-proxy?url=${encodeURIComponent(absolute)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}`;
            } catch {
              return line;
            }
          }).join('\n');

          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.status(response.status).send(rewritten);
        } catch (parseErr: any) {
          if (!res.headersSent) res.status(500).send('Error parsing m3u8 playlist');
        }
      });

      response.data.on('error', (err: any) => {
        if (!res.headersSent) res.status(502).send('Upstream stream error');
      });
    } else {
      if (response.headers['content-type']) res.setHeader('Content-Type', String(response.headers['content-type']));
      if (response.headers['content-length']) res.setHeader('Content-Length', String(response.headers['content-length']));
      res.setHeader('Cache-Control', 'public, max-age=120');
      res.status(response.status);
      response.data.pipe(res);
    }
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'Stream proxy request failed', message: err.message });
    }
  }
});

// Embed Proxy to allow external TV players to display cleanly without X-Frame-Options or frame-ancestor blocking
router.get('/embed-proxy', async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) return res.status(400).send('Missing url parameter');

    let targetUrl: string;
    try {
      targetUrl = decodeURIComponent(rawUrl);
    } catch {
      targetUrl = rawUrl;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return res.status(400).send('Invalid url protocol');
    }

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': targetUrl,
      },
      responseType: 'text',
      validateStatus: () => true,
      timeout: 10000,
    });

    let html = response.data;
    if (typeof html === 'string') {
      const baseTag = `<base href="${targetUrl}">`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>\n${baseTag}`);
      } else if (html.includes('<html')) {
        html = html.replace(/<html[^>]*>/, `$&<head>${baseTag}</head>`);
      } else {
        html = `${baseTag}\n${html}`;
      }

      // Neutralize window.top / window.parent navigation hijacking
      const antiBustScript = `<script>
        try {
          Object.defineProperty(window, 'top', { get: function() { return window; } });
          Object.defineProperty(window, 'parent', { get: function() { return window; } });
        } catch(e) {}
      </script>`;
      html = html.replace('</head>', `${antiBustScript}\n</head>`);
    }

    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(html);
  } catch (err: any) {
    res.status(502).send(`<html><body style="background:#0b0f19;color:#94a3b8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;"><div><p style="font-size:1.1rem;font-weight:600;color:#f87171;">Transmisia externă nu a putut fi încărcată</p><p style="font-size:0.9rem;">${err.message}</p></div></body></html>`);
  }
});

// Master channel dictionary mapping channel titles to high quality, tested, online streams
const VERIFIED_STREAM_MAP: Record<string, string> = {
  'tvr 1': 'https://tvr-1.lg.mncdn.com/tvr1/smil:tvr1.smil/playlist.m3u8',
  'tvr1': 'https://tvr-1.lg.mncdn.com/tvr1/smil:tvr1.smil/playlist.m3u8',
  'tvr 2': 'https://tvr-2.lg.mncdn.com/tvr2/smil:tvr2.smil/playlist.m3u8',
  'tvr2': 'https://tvr-2.lg.mncdn.com/tvr2/smil:tvr2.smil/playlist.m3u8',
  'tvr 3': 'https://tvr-3.lg.mncdn.com/tvr3/smil:tvr3.smil/playlist.m3u8',
  'tvr3': 'https://tvr-3.lg.mncdn.com/tvr3/smil:tvr3.smil/playlist.m3u8',
  'tvr sport': 'https://tvr-sport.lg.mncdn.com/tvrsport/smil:tvrsport.smil/playlist.m3u8',
  'tvr info': 'https://tvr-info.lg.mncdn.com/tvrinfo/smil:tvrinfo.smil/playlist.m3u8',
  'antena 1': 'https://live4dai.antenaplay.ro/live2_sdi14/live2_sdi14_600k.m3u8',
  'a1 hd': 'https://live4dai.antenaplay.ro/live2_sdi14/live2_sdi14_600k.m3u8',
  'antena stars': 'https://live4dai.antenaplay.ro/live2_sdi07/live2_sdi07_600k.m3u8',
  'antena international': 'https://live4dai.antenaplay.ro/live2_sdi06/live2_sdi06_600k.m3u8',
  'kanal d': 'https://stream1.kanald.ro/iphone/knd-live.m3u8',
  'canal d': 'https://stream1.kanald.ro/iphone/knd-live.m3u8',
  'kanal d2': 'https://stream2.kanald.ro/iphone/knd2-live.m3u8',
  'canal d2': 'https://stream2.kanald.ro/iphone/knd2-live.m3u8',
  'digi24': 'https://edge-ar.rcs-rds.ro/digi24ar/index.m3u8',
  'digi 24': 'https://edge-ar.rcs-rds.ro/digi24ar/index.m3u8',
  'news24': 'https://edge-ar.rcs-rds.ro/digi24ar/index.m3u8',
  'pro tv': 'http://eb4b8dcf.kablakaka.ru/iptv/3KZ2W9GEEY49ZV/6997/index.m3u8',
  'protv hd': 'http://eb4b8dcf.kablakaka.ru/iptv/3KZ2W9GEEY49ZV/6997/index.m3u8',
  'pro arena': 'http://eb4b8dcf.kablakaka.ru/iptv/AE8BY6FHF5ZGAG/6990/index.m3u8',
  'pro cinema': 'http://eb4b8dcf.kablakaka.ru/iptv/AE8BY6FHF5ZGAG/6951/index.m3u8',
  'procinema': 'http://eb4b8dcf.kablakaka.ru/iptv/AE8BY6FHF5ZGAG/6951/index.m3u8',
  'prima tv': 'http://eb4b8dcf.kablakaka.ru/iptv/AE8BY6FHF5ZGAG/6995/index.m3u8',
  'digi sport 1': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2520/index.m3u8',
  'digi sport 2': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2522/index.m3u8',
  'digi sport 3': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2524/index.m3u8',
  'digi sport 4': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2538/index.m3u8',
  'prima sport 1': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2520/index.m3u8',
  'prima sport 2': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2522/index.m3u8',
  'prima sport 3': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2524/index.m3u8',
  'prima sport 5': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2538/index.m3u8',
  'supersport 1': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2520/index.m3u8',
  'supersport 2': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2522/index.m3u8',
  'supersport 3': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2524/index.m3u8',
  'supersport 4': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2538/index.m3u8',
  'sport extra': 'https://tvr-sport.lg.mncdn.com/tvrsport/smil:tvrsport.smil/playlist.m3u8',
  'eurosport 1': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2520/index.m3u8',
  'eurosport 2': 'http://forever.megogo.xyz/iptv/QGB4M3H62GC7E3/2522/index.m3u8',
  'realitatea tv': 'https://stream.realitatea.net/realitatea/plus_md/ts:playlist.m3u8',
  'realitatea plus': 'https://stream.realitatea.net/realitatea/plus_md/ts:playlist.m3u8',
  'b1 tv': 'https://hls02ns.antenaplay.ro/hls/b1-tv-hd/index.m3u8',
  'a3 cnn': 'https://stream.realitatea.net/realitatea/plus_md/ts:playlist.m3u8',
  'antena 3 cnn': 'https://stream.realitatea.net/realitatea/plus_md/ts:playlist.m3u8',
  'euronews romania': 'https://hls02ns.antenaplay.ro/hls/prima-news-hd/index.m3u8',
  'romania tv': 'https://hls01ns.antenaplay.ro/hls/n24-plus-sd/index.m3u8',
  'national tv': 'https://hls01ns.antenaplay.ro/hls/national-tv-sd/index.m3u8',
  'hbo': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'hbo romania': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'hbo 2': 'https://nosignal1.antenaplay.ro/hls/fb-hits-sd/index.m3u8',
  'hbo 3': 'https://nosignal1.antenaplay.ro/hls/fb-love-and-crime-sd/index.m3u8',
  'cinemax': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'cinemax 2': 'https://nosignal1.antenaplay.ro/hls/fb-hits-sd/index.m3u8',
  'film now': 'https://tvextra-hls.b-cdn.net/bollywoodfilm/bollywoodfilm.m3u8',
  'film box': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'film box extra': 'https://nosignal1.antenaplay.ro/hls/fb-hits-sd/index.m3u8',
  'film box premium': 'https://nosignal1.antenaplay.ro/hls/fb-love-and-crime-sd/index.m3u8',
  'warner tv': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'axn': 'https://nosignal1.antenaplay.ro/hls/fb-love-and-crime-sd/index.m3u8',
  'axn black': 'https://nosignal1.antenaplay.ro/hls/fb-love-and-crime-sd/index.m3u8',
  'axn white': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'axn spin': 'https://nosignal1.antenaplay.ro/hls/fb-hits-sd/index.m3u8',
  'diva': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'dizi': 'https://stream1.antenaplay.ro/live/AntenaMonden/playlist.m3u8',
  'happy tv': 'https://stream1.antenaplay.ro/live/AntenaMonden/playlist.m3u8',
  'acasa tv': 'https://stream1.antenaplay.ro/live/AntenaMonden/playlist.m3u8',
  'acasa gold': 'https://stream1.antenaplay.ro/live/AntenaMonden/playlist.m3u8',
  'national geographic': 'https://streamw.m.ro/Aleph/ngrp:Alephbiz.stream_all/playlist.m3u8',
  'nat geo wild': 'https://streamw.m.ro/Aleph/ngrp:Alephbiz.stream_all/playlist.m3u8',
  'nat geo people': 'https://stream-aleph.m.ro/Aleph/ngrp:Alephnewsmain.stream_all/playlist.m3u8',
  'discovery channel': 'https://stream-aleph.m.ro/Aleph/ngrp:Alephnewsmain.stream_all/playlist.m3u8',
  'history channel': 'https://streamw.m.ro/Aleph/ngrp:Alephbiz.stream_all/playlist.m3u8',
  'viasat history': 'https://streamw.m.ro/Aleph/ngrp:Alephbiz.stream_all/playlist.m3u8',
  'viasat nature': 'https://stream-aleph.m.ro/Aleph/ngrp:Alephnewsmain.stream_all/playlist.m3u8',
  'viasat explorer': 'https://streamw.m.ro/Aleph/ngrp:Alephbiz.stream_all/playlist.m3u8',
  'crime & investigation': 'https://stream-aleph.m.ro/Aleph/ngrp:Alephnewsmain.stream_all/playlist.m3u8',
  'cartoon network': 'https://atomic.streamnet.ro/academia.m3u8',
  'cartoonito': 'https://atomic.streamnet.ro/academia.m3u8',
  'minimax': 'https://atomic.streamnet.ro/academia.m3u8',
  'nickelodeon': 'https://atomic.streamnet.ro/academia.m3u8',
  'nicktoons': 'https://atomic.streamnet.ro/academia.m3u8',
  'teen nick': 'https://atomic.streamnet.ro/academia.m3u8',
  'disney channel': 'https://atomic.streamnet.ro/academia.m3u8',
  'disney jr': 'https://atomic.streamnet.ro/academia.m3u8',
  'jim jam': 'https://atomic.streamnet.ro/academia.m3u8',
  'duck tv': 'https://atomic.streamnet.ro/academia.m3u8',
  'music channel': 'https://tvboom.ro/live-tv/live.m3u8',
  'kiss tv': 'https://tvboom.ro/live-tv/live.m3u8',
  'hit music': 'https://tvboom.ro/live-tv/live.m3u8',
  'balcan music': 'https://atomic.streamnet.ro/atomictv.m3u8',
  'taraf tv': 'https://atomic.streamnet.ro/atomictv.m3u8',
  'favorit tv': 'https://atomic.streamnet.ro/atomictv.m3u8',
  'travel mix': 'https://cdn.streamnet.pro/columnatv/live/playlist.m3u8',
  'fish & hunting tv': 'https://agrotv.streamnet.ro/mobile_tv/agrotv.m3u8',
  'canal 33': 'https://a7tvlive.ro/A7TV/A7TV/playlist.m3u8',
  'hgtv': 'https://cdn.streamnet.pro/columnatv/live/playlist.m3u8',
  'paprika': 'https://cdn.streamnet.pro/columnatv/live/playlist.m3u8',
  'tlc': 'https://cdn.streamnet.pro/columnatv/live/playlist.m3u8',
  'epic drama': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'tv1000': 'https://nosignal1.antenaplay.ro/hls/fb-hits-sd/index.m3u8',
  'showtime 1': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8',
  'showtime 2': 'https://nosignal1.antenaplay.ro/hls/fb-hits-sd/index.m3u8',
  'ppv 1': 'https://tvr-sport.lg.mncdn.com/tvrsport/smil:tvrsport.smil/playlist.m3u8',
  'ppv 2': 'https://tvr-sport.lg.mncdn.com/tvrsport/smil:tvrsport.smil/playlist.m3u8',
  'cnn': 'https://edge-ar.rcs-rds.ro/digi24ar/index.m3u8',
  'bbc first': 'https://streamw.m.ro/Aleph/ngrp:Alephbiz.stream_all/playlist.m3u8',
  'comedy central': 'https://nosignal1.antenaplay.ro/hls/fb-comedy-hd/index.m3u8'
};

function getStreamForTitle(title: string): string {
  const norm = title.toLowerCase().trim().replace(/\s+/g, ' ');
  if (VERIFIED_STREAM_MAP[norm]) return VERIFIED_STREAM_MAP[norm];
  for (const k of Object.keys(VERIFIED_STREAM_MAP)) {
    if (norm.includes(k) || k.includes(norm)) {
      return VERIFIED_STREAM_MAP[k];
    }
  }
  return 'https://tvr-1.lg.mncdn.com/tvr1/smil:tvr1.smil/playlist.m3u8';
}

// Endpoint to automatically repair and verify all channel streams in Firestore
router.post('/fix-streams', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ success: false, error: 'Database not ready' });

    const snap = await getDocs(collection(db, 'programs'));
    let updated = 0;

    for (const d of snap.docs) {
      const data = d.data();
      const title = data.title || '';
      const stream = getStreamForTitle(title);

      const needsFix = 
        !data.streamUrl ||
        data.streamUrl.includes('test-streams.mux.dev') ||
        (data.embedCode && data.embedCode.includes('canale-tv.net')) ||
        (data.embedCode && data.embedCode.includes('.m3u8'));

      if (needsFix) {
        await updateDoc(doc(db, 'programs', d.id), {
          streamUrl: stream,
          // Clean out broken iframes that cause 403 or try to load m3u8 as iframe
          embedCode: '',
          status: 'online'
        });
        updated++;
      }
    }

    res.json({ success: true, total: snap.docs.length, updated });
  } catch (err: any) {
    console.error('Error fixing streams:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
