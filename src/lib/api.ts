import { db, auth, loginWithGoogle, logout, handleFirestoreError } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, increment } from 'firebase/firestore';
import { clientCache } from './cache';
import { getChannelFullDaySchedule } from './tvScheduleUtils';
import { MASTER_CHANNELS_LIST, normalizeChannelId, createDynamicChannelFallback } from './channelsData';

export const getAuthToken = () => localStorage.getItem('admin_token');

export const DEFAULT_PROGRAMS = MASTER_CHANNELS_LIST;

export const DEFAULT_PROGRAM_CATEGORIES = [
  { id: 'cat-generalist', name: 'Generalist', slug: 'generalist' },
  { id: 'cat-sport', name: 'Sport', slug: 'sport' },
  { id: 'cat-stiri', name: 'Știri', slug: 'stiri' },
  { id: 'cat-filme', name: 'Filme', slug: 'filme' },
  { id: 'cat-documentare', name: 'Documentare', slug: 'documentare' },
  { id: 'cat-copii', name: 'Copii', slug: 'copii' },
  { id: 'cat-muzica', name: 'Muzică', slug: 'muzica' }
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
    return clientCache.fetchWithCache('programs', async () => {
      try {
        const q = collection(db, 'programs');
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          return MASTER_CHANNELS_LIST;
        }
        
        // Merge Firestore programs with MASTER_CHANNELS_LIST so no channel is missing
        const dbPrograms = snapshot.docs.map(mapDoc);
        const dbIds = new Set(dbPrograms.map((p: any) => p.id));
        const missingFromDb = MASTER_CHANNELS_LIST.filter(p => !dbIds.has(p.id));
        
        return [...dbPrograms, ...missingFromDb];
      } catch(err) {
        console.warn('Failed to load programs from Firestore, using master list:', err);
        return MASTER_CHANNELS_LIST;
      }
    }, 5 * 60 * 1000);
  },
  getProgram: async (rawId: string) => {
    if (!rawId) rawId = 'pro-tv';
    const canonicalId = normalizeChannelId(rawId);

    // Check cached programs first for immediate resolution
    const cachedPrograms = clientCache.get<any[]>('programs');
    const fromList = cachedPrograms?.find(p => p.id === canonicalId || p.id === rawId);
    if (fromList) return fromList;

    // Fetch or verify from server
    return clientCache.fetchWithCache(`program_${canonicalId}`, async () => {
      // 1. Try Firestore with canonical ID
      try {
        const programRef = doc(db, 'programs', canonicalId);
        const d = await getDoc(programRef);
        if (d.exists()) {
          updateDoc(programRef, { views: increment(1) }).catch(() => {});
          const currentData = d.data();
          return { id: d.id, ...currentData, views: (currentData.views || 0) + 1 } as any;
        }
      } catch (e) {
        // Firestore fetch error (offline or rules)
      }

      // 2. Try Firestore with raw ID if different
      if (rawId !== canonicalId) {
        try {
          const rawRef = doc(db, 'programs', rawId);
          const d2 = await getDoc(rawRef);
          if (d2.exists()) {
            updateDoc(rawRef, { views: increment(1) }).catch(() => {});
            const currentData = d2.data();
            return { id: d2.id, ...currentData, views: (currentData.views || 0) + 1 } as any;
          }
        } catch (e) {}
      }

      // 3. Search in MASTER_CHANNELS_LIST
      const foundMaster = MASTER_CHANNELS_LIST.find(p => 
        p.id === canonicalId || 
        p.id === rawId || 
        p.id.toLowerCase() === rawId.toLowerCase()
      );
      if (foundMaster) return foundMaster;

      // 4. Dynamic safe fallback: ALWAYS return a valid channel object instead of crashing with 404
      return createDynamicChannelFallback(rawId);
    }, 5 * 60 * 1000);
  },
  createProgram: async (data: any) => {
    const ref = doc(collection(db, 'programs'));
    const insert = { ...data, createdAt: new Date().toISOString() };
    await setDoc(ref, insert);
    clientCache.invalidate('programs');
    clientCache.invalidate(`program_${ref.id}`);
    return { id: ref.id, ...insert };
  },
  updateProgram: async (id: string, data: any) => {
    await updateDoc(doc(db, 'programs', id), data);
    clientCache.invalidate('programs');
    clientCache.invalidate(`program_${id}`);
    return { id, ...data };
  },
  deleteProgram: async (id: string) => {
    await deleteDoc(doc(db, 'programs', id));
    clientCache.invalidate('programs');
    clientCache.invalidate(`program_${id}`);
    return { success: true };
  },
  
  // Articles
  getArticles: async () => {
    return clientCache.fetchWithCache('articles', async () => {
      const q = collection(db, 'articles');
      const snapshot = await getDocs(q);
      return snapshot.docs.map(mapDoc);
    }, 5 * 60 * 1000);
  },
  getArticle: async (identifier: string) => {
    // Try to decode identifier just in case it came url-encoded
    try { identifier = decodeURIComponent(identifier); } catch(e) {}
    
    // Check cached articles list
    const cachedArticles = clientCache.get<any[]>('articles');
    const fromList = cachedArticles?.find(a => a.id === identifier || a.slug === identifier);

    return clientCache.fetchWithCache(`article_${identifier}`, async () => {
      // Try by ID first
      try {
        let d = await getDoc(doc(db, 'articles', identifier));
        if (d.exists()) {
          updateDoc(doc(db, 'articles', identifier), { views: increment(1) }).catch(() => {});
          return { ...mapDoc(d), views: (d.data().views || 0) + 1 };
        }
      } catch(e) {
        // Fallback to slug
      }
      
      // Try by slug
      const q = query(collection(db, 'articles'), where('slug', '==', identifier));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docR = snapshot.docs[0];
        updateDoc(doc(db, 'articles', docR.id), { views: increment(1) }).catch(() => {});
        return { ...mapDoc(docR), views: (docR.data().views || 0) + 1 };
      }
      if (fromList) return fromList;
      throw new Error('Not found');
    }, 5 * 60 * 1000);
  },
  createArticle: async (data: any) => {
    const ref = doc(collection(db, 'articles'));
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug, createdAt: new Date().toISOString() };
    await setDoc(ref, insert);
    clientCache.invalidate('articles');
    return { id: ref.id, ...insert };
  },
  updateArticle: async (id: string, data: any) => {
    const slug = data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;
    const update = slug ? { ...data, slug } : data;
    await updateDoc(doc(db, 'articles', id), update);
    clientCache.invalidate('articles');
    return { id, ...update };
  },
  deleteArticle: async (id: string) => {
    await deleteDoc(doc(db, 'articles', id));
    clientCache.invalidate('articles');
    return { success: true };
  },

  // Shows
  getShows: async () => {
    return clientCache.fetchWithCache('shows', async () => {
      const snapshot = await getDocs(collection(db, 'shows'));
      return snapshot.docs.map(mapDoc);
    }, 5 * 60 * 1000);
  },
  getShow: async (identifier: string) => {
    try { identifier = decodeURIComponent(identifier); } catch(e) {}
    return clientCache.fetchWithCache(`show_${identifier}`, async () => {
      try {
        let d = await getDoc(doc(db, 'shows', identifier));
        if (d.exists()) return mapDoc(d);
      } catch(e) {}
      const q = query(collection(db, 'shows'), where('slug', '==', identifier));
      const snap = await getDocs(q);
      if (!snap.empty) return mapDoc(snap.docs[0]);
      throw new Error('Not found');
    }, 5 * 60 * 1000);
  },
  createShow: async (data: any) => {
    const ref = doc(collection(db, 'shows'));
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug, createdAt: new Date().toISOString() };
    await setDoc(ref, insert);
    clientCache.invalidate('shows');
    return { id: ref.id, ...insert };
  },
  updateShow: async (id: string, data: any) => {
    const slug = data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;
    const update = slug ? { ...data, slug } : data;
    await updateDoc(doc(db, 'shows', id), update);
    clientCache.invalidate('shows');
    return { id, ...update };
  },
  deleteShow: async (id: string) => {
    await deleteDoc(doc(db, 'shows', id));
    clientCache.invalidate('shows');
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
    return clientCache.fetchWithCache('categories', async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      return snapshot.docs.map(mapDoc);
    }, 10 * 60 * 1000);
  },
  createCategory: async (data: any) => {
    const ref = doc(collection(db, 'categories'));
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug };
    await setDoc(ref, insert);
    clientCache.invalidate('categories');
    return { id: ref.id, ...insert };
  },
  deleteCategory: async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
    clientCache.invalidate('categories');
    return { success: true };
  },

  // Program Categories
  getProgramCategories: async () => {
    return clientCache.fetchWithCache('program_categories', async () => {
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
    }, 10 * 60 * 1000);
  },
  createProgramCategory: async (data: any) => {
    const ref = doc(collection(db, 'program_categories'));
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const insert = { ...data, slug };
    await setDoc(ref, insert);
    clientCache.invalidate('program_categories');
    return { id: ref.id, ...insert };
  },
  deleteProgramCategory: async (id: string) => {
    await deleteDoc(doc(db, 'program_categories', id));
    clientCache.invalidate('program_categories');
    return { success: true };
  },

  // TV Schedule
  getSchedule: async () => {
    return clientCache.fetchWithCache('schedule', async () => {
      try {
        const snapshot = await getDocs(collection(db, 'schedule'));
        if (!snapshot.empty) {
          return snapshot.docs.map(mapDoc);
        }
      } catch(err) {
        console.warn("Could not read schedule from Firestore, using auto-generated schedule:", err);
      }
      
      // Fallback: provide rich TV guide items for today, yesterday, and upcoming days
      const channelIds = ['pro-tv', 'antena-1', 'digi-sport-1', 'kanal-d', 'hbo', 'digi-sport-2', 'prima-tv', 'digi24', 'tvr-1', 'pro-arena', 'national-geographic'];
      const daysOffset = [-1, 0, 1, 2, 3];
      const generated: any[] = [];
      
      for (const offset of daysOffset) {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        const dateStr = d.toISOString().split('T')[0];
        for (const chId of channelIds) {
          const dayItems = getChannelFullDaySchedule(chId, dateStr);
          dayItems.forEach(item => {
            generated.push({
              id: item.id,
              time: item.time,
              title: item.title,
              description: item.description,
              date: item.date,
              channelId: chId,
              category: item.category
            });
          });
        }
      }
      return generated;
    }, 5 * 60 * 1000);
  },
  createScheduleItem: async (data: any) => {
    const ref = doc(collection(db, 'schedule'));
    await setDoc(ref, data);
    clientCache.invalidate('schedule');
    return { id: ref.id, ...data };
  },
  deleteScheduleItem: async (id: string) => {
    await deleteDoc(doc(db, 'schedule', id));
    clientCache.invalidate('schedule');
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
    return clientCache.fetchWithCache('homepage_config', async () => {
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
    }, 5 * 60 * 1000);
  },
  updateHomepageConfig: async (data: any) => {
    await setDoc(doc(db, 'settings', 'homepage'), data);
    clientCache.invalidate('homepage_config');
    return data;
  },

  // Popup Config
  getPopupConfig: async () => {
    return clientCache.fetchWithCache('popup_config', async () => {
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
    }, 5 * 60 * 1000);
  },
  updatePopupConfig: async (data: any) => {
    await setDoc(doc(db, 'settings', 'popups'), data);
    clientCache.invalidate('popup_config');
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

  // EPG Real Program Guide API
  getLiveEPG: async (channels?: string[]) => {
    try {
      const url = channels && channels.length > 0 
        ? `/api/epg/live?channels=${encodeURIComponent(channels.join(','))}` 
        : '/api/epg/live';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (e) {
      console.warn('Could not fetch live EPG:', e);
      return [];
    }
  },

  getChannelEPG: async (channelId: string, date?: string) => {
    try {
      const url = date 
        ? `/api/epg/channel/${encodeURIComponent(channelId)}?date=${encodeURIComponent(date)}`
        : `/api/epg/channel/${encodeURIComponent(channelId)}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.schedule : [];
    } catch (e) {
      console.warn(`Could not fetch schedule for channel ${channelId}:`, e);
      return [];
    }
  },

  getEPGSchedule: async (params: { date?: string; channel?: string; category?: string; search?: string; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.set('date', params.date);
      if (params.channel) queryParams.set('channel', params.channel);
      if (params.category) queryParams.set('category', params.category);
      if (params.search) queryParams.set('search', params.search);
      if (params.limit) queryParams.set('limit', params.limit.toString());

      const res = await fetch(`/api/epg/schedule?${queryParams.toString()}`);
      const json = await res.json();
      return json.success ? json.items : [];
    } catch (e) {
      console.warn('Could not query EPG schedule:', e);
      return [];
    }
  },

  getUpcomingEPG: async (limit = 12) => {
    try {
      const res = await fetch(`/api/epg/upcoming?limit=${limit}`);
      const json = await res.json();
      return json.success ? json.upcoming : [];
    } catch (e) {
      console.warn('Could not fetch upcoming EPG:', e);
      return [];
    }
  },

  searchEPG: async (q: string) => {
    try {
      const res = await fetch(`/api/epg/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      return json.success ? json.results : [];
    } catch (e) {
      console.warn('Could not search EPG:', e);
      return [];
    }
  },

  getEPGAdminStatus: async () => {
    try {
      const res = await fetch('/api/epg/admin/status');
      return await res.json();
    } catch (e) {
      console.warn('Could not fetch EPG admin status:', e);
      return { success: false, error: (e as any).message };
    }
  },

  triggerEPGSync: async (force = true) => {
    try {
      const res = await fetch('/api/epg/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      return await res.json();
    } catch (e) {
      console.warn('Could not trigger EPG sync:', e);
      return { success: false, message: (e as any).message };
    }
  },

  saveEPGMappings: async (mappings: Record<string, string[]>) => {
    try {
      const res = await fetch('/api/epg/admin/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings })
      });
      return await res.json();
    } catch (e) {
      console.warn('Could not save EPG mappings:', e);
      return { success: false, error: (e as any).message };
    }
  },

  setEPGArtworkOverride: async (title: string, imageUrl: string) => {
    try {
      const res = await fetch('/api/epg/admin/artwork-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, imageUrl })
      });
      return await res.json();
    } catch (e) {
      console.warn('Could not save artwork override:', e);
      return { success: false, error: (e as any).message };
    }
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
