import { db, auth, loginWithGoogle, logout, handleFirestoreError } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, increment } from 'firebase/firestore';

export const getAuthToken = () => localStorage.getItem('admin_token');

export const DEFAULT_PROGRAMS = [
  {
    id: 'pro-tv',
    title: 'Pro TV',
    category: 'Generalist',
    status: 'online',
    quality: '1080p HD',
    rating: 9.2,
    description: 'Pro TV live online - Știrile Pro TV, emisiuni de top și divertisment în calitate HD.',
    thumbnail: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 1240
  },
  {
    id: 'antena-1',
    title: 'Antena 1',
    category: 'Generalist',
    status: 'online',
    quality: '1080p HD',
    rating: 8.9,
    description: 'Antena 1 transmisiune directă online, emisiuni TV, Observator și divertisment.',
    thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 980
  },
  {
    id: 'digi-sport-1',
    title: 'Digi Sport 1',
    category: 'Sport',
    status: 'online',
    quality: '1080p HD',
    rating: 9.5,
    description: 'Digi Sport 1 live online - Liga 1, UEFA Champions League, Formula 1 și tenis ATP/WTA.',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 2150
  },
  {
    id: 'kanal-d',
    title: 'Kanal D',
    category: 'Generalist',
    status: 'online',
    quality: '1080p HD',
    rating: 8.6,
    description: 'Kanal D live - Știrile Kanal D, seriale de succes și emisiuni interactive.',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 730
  },
  {
    id: 'hbo',
    title: 'HBO Romania',
    category: 'Filme',
    status: 'online',
    quality: '4K Ultra HD',
    rating: 9.4,
    description: 'HBO în direct - Filme blockbuster, seriale premiate și premiere cinematografice.',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 1890
  },
  {
    id: 'digi-sport-2',
    title: 'Digi Sport 2',
    category: 'Sport',
    status: 'online',
    quality: '1080p HD',
    rating: 8.8,
    description: 'Digi Sport 2 live stream - Competiții sportive internaționale, fotbal european și handbal.',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 1120
  },
  {
    id: 'prima-tv',
    title: 'Prima TV',
    category: 'Generalist',
    status: 'online',
    quality: '1080p HD',
    rating: 8.3,
    description: 'Prima TV live stream online - Starea Nației, Cronica Cârcotașilor și știri în direct.',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 650
  },
  {
    id: 'digi24',
    title: 'Digi24',
    category: 'Știri',
    status: 'online',
    quality: '1080p HD',
    rating: 9.0,
    description: 'Digi24 live - Știri de ultimă oră, analize economice și transmisiuni speciale din România.',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 1540
  },
  {
    id: 'tvr-1',
    title: 'TVR 1',
    category: 'Știri',
    status: 'online',
    quality: '1080p HD',
    rating: 8.1,
    description: 'TVR 1 online direct - Telejurnal, documentare culturale și evenimente de interes național.',
    thumbnail: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 480
  },
  {
    id: 'pro-arena',
    title: 'Pro Arena',
    category: 'Sport',
    status: 'online',
    quality: '1080p HD',
    rating: 8.5,
    description: 'Pro Arena live stream - Sporturi de contact, emisiuni de analiză sportivă și transmisiuni live.',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 820
  },
  {
    id: 'national-geographic',
    title: 'National Geographic',
    category: 'Documentare',
    status: 'online',
    quality: '1080p HD',
    rating: 9.3,
    description: 'National Geographic HD live - Documentare spectaculoase despre natură, știință și istorie.',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    embedCode: '<iframe src="https://test-streams.mux.dev/x36xhg/main.m3u8" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    views: 1100
  }
];

export const DEFAULT_PROGRAM_CATEGORIES = [
  { id: 'cat-generalist', name: 'Generalist', slug: 'generalist' },
  { id: 'cat-sport', name: 'Sport', slug: 'sport' },
  { id: 'cat-stiri', name: 'Știri', slug: 'stiri' },
  { id: 'cat-filme', name: 'Filme', slug: 'filme' },
  { id: 'cat-documentare', name: 'Documentare', slug: 'documentare' }
];

// Helper to convert Firestore docs to our format with `id`
const mapDoc = (d: any) => ({ id: d.id, ...d.data() });

export const api = {
  login: async () => {
    try {
      const result = await loginWithGoogle();
      return { token: result.user.uid };
    } catch(err) {
      throw new Error("Autentificare eșuată");
    }
  },
  logout: () => logout(),
    
  // Live Programs
  getPrograms: async () => {
    try {
      const q = collection(db, 'programs');
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Auto-seed default programs into Firestore so they persist
        for (const prog of DEFAULT_PROGRAMS) {
          try {
            await setDoc(doc(db, 'programs', prog.id), { ...prog, createdAt: new Date().toISOString() });
          } catch(e) {
            console.warn('Seed program error:', e);
          }
        }
        return DEFAULT_PROGRAMS;
      }
      return snapshot.docs.map(mapDoc);
    } catch(err) {
      console.warn('Failed to load programs from Firestore, using default list:', err);
      return DEFAULT_PROGRAMS;
    }
  },
  getProgram: async (id: string) => {
    try {
      const programRef = doc(db, 'programs', id);
      const d = await getDoc(programRef);
      if (d.exists()) {
        try {
          await updateDoc(programRef, { views: increment(1) });
        } catch (err) {
          console.warn('Could not increment program views:', err);
        }
        const currentData = d.data();
        return { id: d.id, ...currentData, views: (currentData.views || 0) + 1 } as any;
      }
    } catch (e) {
      console.warn('Get program Firestore error:', e);
    }
    const found = DEFAULT_PROGRAMS.find(p => p.id === id);
    if (found) return found;
    throw new Error('Not found');
  },
  createProgram: async (data: any) => {
    const ref = doc(collection(db, 'programs'));
    const insert = { ...data, createdAt: new Date().toISOString() };
    await setDoc(ref, insert);
    return { id: ref.id, ...insert };
  },
  updateProgram: async (id: string, data: any) => {
    await updateDoc(doc(db, 'programs', id), data);
    return { id, ...data };
  },
  deleteProgram: async (id: string) => {
    await deleteDoc(doc(db, 'programs', id));
    return { success: true };
  },
  
  // Articles
  getArticles: async () => {
    const q = collection(db, 'articles');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDoc);
  },
  getArticle: async (identifier: string) => {
    // Try to decode identifier just in case it came url-encoded
    try { identifier = decodeURIComponent(identifier); } catch(e) {}
    
    // Try by ID first
    try {
      let d = await getDoc(doc(db, 'articles', identifier));
      if (d.exists()) {
        try {
          await updateDoc(doc(db, 'articles', identifier), { views: increment(1) });
        } catch(e) {}
        return { ...mapDoc(d), views: (d.data().views || 0) + 1 };
      }
    } catch(e) {
      // Ignore permission/format errors for getDoc by ID and fallback to query by slug
    }
    
    // Try by slug
    const q = query(collection(db, 'articles'), where('slug', '==', identifier));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docR = snapshot.docs[0];
      try {
        await updateDoc(doc(db, 'articles', docR.id), { views: increment(1) });
      } catch(e) {
        // Ignore permission errors for guests
      }
      return { ...mapDoc(docR), views: (docR.data().views || 0) + 1 };
    }
    throw new Error('Not found');
  },
  createArticle: async (data: any) => {
    const ref = doc(collection(db, 'articles'));
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug, createdAt: new Date().toISOString() };
    await setDoc(ref, insert);
    return { id: ref.id, ...insert };
  },
  updateArticle: async (id: string, data: any) => {
    const slug = data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;
    const update = slug ? { ...data, slug } : data;
    await updateDoc(doc(db, 'articles', id), update);
    return { id, ...update };
  },
  deleteArticle: async (id: string) => {
    await deleteDoc(doc(db, 'articles', id));
    return { success: true };
  },

  // Shows
  getShows: async () => {
    const snapshot = await getDocs(collection(db, 'shows'));
    return snapshot.docs.map(mapDoc);
  },
  getShow: async (identifier: string) => {
    try { identifier = decodeURIComponent(identifier); } catch(e) {}
    try {
      let d = await getDoc(doc(db, 'shows', identifier));
      if (d.exists()) return mapDoc(d);
    } catch(e) {}
    const q = query(collection(db, 'shows'), where('slug', '==', identifier));
    const snap = await getDocs(q);
    if (!snap.empty) return mapDoc(snap.docs[0]);
    throw new Error('Not found');
  },
  createShow: async (data: any) => {
    const ref = doc(collection(db, 'shows'));
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug, createdAt: new Date().toISOString() };
    await setDoc(ref, insert);
    return { id: ref.id, ...insert };
  },
  updateShow: async (id: string, data: any) => {
    const slug = data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;
    const update = slug ? { ...data, slug } : data;
    await updateDoc(doc(db, 'shows', id), update);
    return { id, ...update };
  },
  deleteShow: async (id: string) => {
    await deleteDoc(doc(db, 'shows', id));
    return { success: true };
  },

  // Episodes
  getEpisodes: async (showId: string) => {
    const q = query(collection(db, 'episodes'), where('showId', '==', showId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDoc);
  },
  getEpisode: async (id: string) => {
    const d = await getDoc(doc(db, 'episodes', id));
    if(!d.exists()) throw new Error('Not found');
    return mapDoc(d);
  },
  createEpisode: async (showId: string, data: any) => {
    const ref = doc(collection(db, 'episodes'));
    const insert = { ...data, showId, createdAt: new Date().toISOString() };
    await setDoc(ref, insert);
    return { id: ref.id, ...insert };
  },
  updateEpisode: async (id: string, data: any) => {
    await updateDoc(doc(db, 'episodes', id), data);
    return { id, ...data };
  },
  deleteEpisode: async (id: string) => {
    await deleteDoc(doc(db, 'episodes', id));
    return { success: true };
  },

  // Comments
  getComments: async () => {
    const snapshot = await getDocs(collection(db, 'comments'));
    return snapshot.docs.map(mapDoc);
  },
  createComment: async (data: any) => {
    const ref = doc(collection(db, 'comments'));
    const insert = { ...data, createdAt: new Date().toISOString(), approved: false };
    await setDoc(ref, insert);
    return { id: ref.id, ...insert };
  },
  approveComment: async (id: string) => {
    await updateDoc(doc(db, 'comments', id), { approved: true });
    return { id, approved: true };
  },
  deleteComment: async (id: string) => {
    await deleteDoc(doc(db, 'comments', id));
    return { success: true };
  },

  // Categories
  getCategories: async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(mapDoc);
  },
  createCategory: async (data: any) => {
    const ref = doc(collection(db, 'categories'));
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug };
    await setDoc(ref, insert);
    return { id: ref.id, ...insert };
  },
  deleteCategory: async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
    return { success: true };
  },

  // Program Categories
  getProgramCategories: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'program_categories'));
      if (snapshot.empty) {
        for (const cat of DEFAULT_PROGRAM_CATEGORIES) {
          try {
            await setDoc(doc(db, 'program_categories', cat.id), cat);
          } catch (e) {}
        }
        return DEFAULT_PROGRAM_CATEGORIES;
      }
      return snapshot.docs.map(mapDoc);
    } catch(e) {
      return DEFAULT_PROGRAM_CATEGORIES;
    }
  },
  createProgramCategory: async (data: any) => {
    const ref = doc(collection(db, 'program_categories'));
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug };
    await setDoc(ref, insert);
    return { id: ref.id, ...insert };
  },
  deleteProgramCategory: async (id: string) => {
    await deleteDoc(doc(db, 'program_categories', id));
    return { success: true };
  },

  // TV Schedule
  getSchedule: async () => {
    const snapshot = await getDocs(collection(db, 'schedule'));
    return snapshot.docs.map(mapDoc);
  },
  createScheduleItem: async (data: any) => {
    const ref = doc(collection(db, 'schedule'));
    await setDoc(ref, data);
    return { id: ref.id, ...data };
  },
  deleteScheduleItem: async (id: string) => {
    await deleteDoc(doc(db, 'schedule', id));
    return { success: true };
  },

  // World Cup Matches
  getWorldCupMatches: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'world_cup_matches'));
      if (snapshot.empty) {
        const { WORLD_CUP_MATCHES } = await import('../pages/public/worldCupData');
        return WORLD_CUP_MATCHES;
      }
      return snapshot.docs.map(mapDoc);
    } catch(err) {
      console.warn("Could not fetch world cup matches from DB", err);
      const { WORLD_CUP_MATCHES } = await import('../pages/public/worldCupData');
      return WORLD_CUP_MATCHES;
    }
  },
  getWorldCupMatchViews: async () => {
    try {
      const q = collection(db, 'articles');
      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(mapDoc);
      const viewsMap: Record<string, number> = {};
      const { WORLD_CUP_MATCHES } = await import('../pages/public/worldCupData');
      
      for (const match of WORLD_CUP_MATCHES) {
        let matchViews = 0;
        const pt1 = match.team1.toLowerCase();
        const pt2 = match.team2.toLowerCase();
        
        for (const art of articles) {
          if (art.categoryId === 'world-cup' && art.title) {
            const title = art.title.toLowerCase();
            // Try to match both teams in title, accounting for language variations (e.g. Țările de Jos = Netherlands, dar in RO au scris Olanda, etc. wait!)
            // I should map manual translations just in case, or just do a generic check.
            const mapTe = (t: string) => {
              if(t === 'south africa') return ['africa de sud', 'south africa'];
              if(t === 'mexico') return ['mexic', 'mexico'];
              if(t === 'south korea') return ['coreea de sud', 'south korea'];
              if(t === 'czechia') return ['cehia', 'czechia'];
              if(t === 'bosnia & herzegovina') return ['bosnia', 'bosnia și herțegovina'];
              if(t === 'paraguay') return ['paraguay'];
              if(t === 'usa') return ['sua', 'usa'];
              if(t === 'qatar') return ['qatar'];
              if(t === 'switzerland') return ['elveția', 'switzerland', 'elvetia'];
              if(t === 'brazil') return ['brazilia', 'brazil'];
              if(t === 'morocco') return ['maroc', 'morocco'];
              if(t === 'haiti') return ['haiti'];
              if(t === 'scotland') return ['scoția', 'scotia', 'scotland'];
              if(t === 'australia') return ['australia'];
              if(t === 'turkey') return ['turcia', 'turkey'];
              if(t === 'germany') return ['germania', 'germany'];
              if(t === 'curacao') return ['curacao', 'curaçao'];
              if(t === 'netherlands') return ['olanda', 'țările de jos', 'netherlands'];
              if(t === 'japan') return ['japonia', 'japan'];
              if(t === 'ivory coast') return ['coasta de fildeș', 'coasta de fildes', 'ivory coast'];
              if(t === 'ecuador') return ['ecuador'];
              if(t === 'sweden') return ['suedia', 'sweden'];
              if(t === 'tunisia') return ['tunisia'];
              return [t];
            };
            
            const aliases1 = mapTe(pt1);
            const aliases2 = mapTe(pt2);
            
            const hasT1 = aliases1.some(a => title.includes(a));
            const hasT2 = aliases2.some(a => title.includes(a));
            
            if (hasT1 && hasT2) {
              matchViews += (art.views || 0);
            }
          }
        }
        viewsMap[`/world-cup/${match.id}`] = matchViews;
      }
      return viewsMap;
    } catch(e) {
      console.warn('Error fetching wc views', e);
      return {};
    }
  },
  getWorldCupMatch: async (id: string) => {
    try {
      const d = await getDoc(doc(db, 'world_cup_matches', id));
      if (!d.exists()) {
         const { WORLD_CUP_MATCHES } = await import('../pages/public/worldCupData');
         return WORLD_CUP_MATCHES.find(m => m.id === id) || null;
      }
      return mapDoc(d);
    } catch(err) {
      console.warn("Could not fetch world cup match details", err);
      const { WORLD_CUP_MATCHES } = await import('../pages/public/worldCupData');
      return WORLD_CUP_MATCHES.find(m => m.id === id) || null;
    }
  },

  // Homepage Config
  getHomepageConfig: async () => {
    const d = await getDoc(doc(db, 'settings', 'homepage'));
    if (!d.exists()) {
      return {
        heroTitle: "Bine ai venit pe programetv.online",
        heroSubtitle: "Urmărește cele mai bune emisiuni și transmisiuni live.",
        heroBackgroundImage: "",
        heroLink: ""
      };
    }
    return mapDoc(d);
  },
  updateHomepageConfig: async (data: any) => {
    await setDoc(doc(db, 'settings', 'homepage'), data);
    return data;
  },

  // Popup Config
  getPopupConfig: async () => {
    const d = await getDoc(doc(db, 'settings', 'popups'));
    if (!d.exists()) {
      return {
        active: false,
        type: 'info',
        title: 'Anunț Important',
        content: 'Bine ai venit pe platforma noastră! Dacă apreciezi munca noastră, ne poți susține printr-o mică donație.',
        imageUrl: '',
        linkUrl: '/donations',
        linkText: 'Donează acum',
        triggerType: 'once',
        delaySeconds: 5,
        cookieExpiryDays: 1,
      };
    }
    return mapDoc(d);
  },
  updatePopupConfig: async (data: any) => {
    await setDoc(doc(db, 'settings', 'popups'), data);
    return data;
  },

  // Search
  search: async (qStr: string) => {
    const queryStr = (qStr || '').toLowerCase();
    const articles = await api.getArticles();
    const shows = await api.getShows();
    const live = await api.getPrograms();
    
    // Simplistic search (client side on fetched data since Firestore text search is limited)
    return {
      articles: articles.filter((a: any) => a.title.toLowerCase().includes(queryStr) || a.content.toLowerCase().includes(queryStr)),
      shows: shows.filter((s: any) => s.title.toLowerCase().includes(queryStr) || s.description.toLowerCase().includes(queryStr)),
      episodes: [], // episodes omitted for simplicity if we fetch all
      live: live.filter((l: any) => l.title.toLowerCase().includes(queryStr) || l.description.toLowerCase().includes(queryStr))
    };
  },

  getStats: async () => {
    const live = await api.getPrograms();
    return {
      totalPrograms: live.length,
      totalViews: live.reduce((acc: number, cur: any) => acc + (cur.views || 0), 0),
      onlinePrograms: live.filter((p: any) => p.status === 'online').length,
      categories: live.reduce((acc: any, cur: any) => {
        acc[cur.category] = (acc[cur.category] || 0) + 1;
        return acc;
      }, {})
    };
  },
  
  uploadFile: async (file: File): Promise<any> => {
    // We will just return a placeholder or handle somehow.
    // For now we can use browser's FileReader to create a base64 string, or just error.
    // Usually Firebase Storage is better but we don't have it enabled in rules here automatically.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result }); // return base64
      };
      reader.readAsDataURL(file);
    });
  }
};
