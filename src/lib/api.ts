import { db, auth, loginWithGoogle, logout, handleFirestoreError } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, increment } from 'firebase/firestore';

export const getAuthToken = () => localStorage.getItem('admin_token');

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
    const q = collection(db, 'programs');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDoc);
  },
  getProgram: async (id: string) => {
    const programRef = doc(db, 'programs', id);
    const d = await getDoc(programRef);
    if (!d.exists()) throw new Error('Not found');
    try {
      await updateDoc(programRef, { views: increment(1) });
    } catch (err) {
      console.warn('Could not increment program views:', err);
    }
    const currentData = d.data();
    return { id: d.id, ...currentData, views: (currentData.views || 0) + 1 } as any;
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
    // Try by ID first
    let d = await getDoc(doc(db, 'articles', identifier));
    if (d.exists()) {
      await updateDoc(doc(db, 'articles', identifier), { views: increment(1) });
      return { ...mapDoc(d), views: (d.data().views || 0) + 1 };
    }
    // Try by slug
    const q = query(collection(db, 'articles'), where('slug', '==', identifier));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docR = snapshot.docs[0];
      await updateDoc(doc(db, 'articles', docR.id), { views: increment(1) });
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
    let d = await getDoc(doc(db, 'shows', identifier));
    if (d.exists()) return mapDoc(d);
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
