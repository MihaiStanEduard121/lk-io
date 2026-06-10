import express from 'express';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getDb } from '../firebaseAdmin.js';

const router = express.Router();

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

export default router;
