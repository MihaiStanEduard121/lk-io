import { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { Show, ArticleCategory } from '../../types';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ListVideo, Tv, Play } from 'lucide-react';

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const context = useOutletContext<{ theme?: string; isDark?: boolean }>() || {};
  const isDark = context.isDark ?? (context.theme === 'dark');

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([api.getShows(), api.getCategories()]).then(([showsData, catsData]) => {
      setShows((showsData || []).sort((a: Show, b: Show) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCategories(catsData || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const matchShowWithCategory = (show: any, cat: { id: string, name: string, slug: string }) => {
    const nameLower = cat.name.toLowerCase();
    const slugLower = cat.slug.toLowerCase();
    
    if (show.category && (show.category.toLowerCase() === nameLower || show.category.toLowerCase() === slugLower)) {
      return true;
    }
    if (show.categoryId && show.categoryId === cat.id) {
      return true;
    }
    
    const title = (show.title || '').toLowerCase();
    const desc = (show.description || '').toLowerCase();
    const normName = normalize(nameLower);
    
    return normalize(title).includes(normName) || normalize(desc).includes(normName);
  };

  const activeCategories = useMemo(() => {
    return categories.filter(cat => 
      shows.some(show => matchShowWithCategory(show, cat))
    );
  }, [shows, categories]);

  const filteredShows = useMemo(() => {
    if (selectedCategory === 'All') return shows;
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? shows.filter(show => matchShowWithCategory(show, cat)) : shows;
  }, [shows, selectedCategory, categories]);

  if (loading) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center font-bold ${
        isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-slate-50 text-slate-500'
      }`}>
        <div className="flex h-4 w-4 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600"></span>
        </div>
        <span className="text-sm font-semibold">Se încarcă emisiunile...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 transition-colors duration-200 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs mb-1">
              <ListVideo className="w-4 h-4" />
              <span>Catalog Video la Cerere</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Emisiuni pe Demand
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Seriale, reality show-uri, meciuri și înregistrări ale celor mai populare producții TV.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        {activeCategories.length > 0 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
            >
              Toate Emisiunile ({shows.length})
            </button>
            {activeCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : isDark 
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
        
        {filteredShows.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl border p-8 max-w-md mx-auto ${
            isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <Tv className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
              Nicio emisiune găsită
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Momentan nu există emisiuni disponibile pentru această categorie.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredShows.map((show, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                key={show.id}
              >
                <Link 
                  to={`/shows/${show.slug || show.id}`} 
                  className={`group block rounded-2xl overflow-hidden border transition-all duration-200 shadow-xs hover:shadow-md ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-slate-200 dark:bg-zinc-900">
                    {show.thumbnail ? (
                      <img 
                        src={show.thumbnail} 
                        alt={show.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(show.title)}&background=312e81&color=fff&size=500` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-3xl text-slate-400">
                        {show.title[0]}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h2 className={`text-xs font-black line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                      isDark ? 'text-zinc-200' : 'text-slate-800'
                    }`}>
                      {show.title}
                    </h2>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 block mt-0.5 truncate">
                      {show.category || 'Divertisment'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
