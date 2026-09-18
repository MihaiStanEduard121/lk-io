import { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { TVProgram, Show, HomepageConfig, ProgramCategory } from '../../types';
import { Play, Star, Users, Search, Radio, Heart, ChevronRight, MonitorPlay, Tv } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useOutletContext } from 'react-router-dom';
import { getCalculatedLiveViewers, formatViewerCount } from '../../lib/viewerUtils';
import AdBanner from '../../components/AdBanner';

export default function Home() {
  const context = useOutletContext<{ theme?: string }>() || {};
  const theme = context.theme || 'light';
  const isDark = theme === 'dark';

  const [programs, setSchedules] = useState<TVProgram[]>([]);
  const [dbProgramCategories, setDbProgramCategories] = useState<ProgramCategory[]>([]);
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [liveViewers, setLiveViewers] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categoriesList = useMemo(() => {
    if (dbProgramCategories && dbProgramCategories.length > 0) {
      const matchesCategoryName = (p: TVProgram, catName: string) => {
        return p.category && p.category.toLowerCase() === catName.toLowerCase();
      };

      const activeCats = dbProgramCategories.filter(cat => 
        programs.some(p => matchesCategoryName(p, cat.name))
      );

      return [
        { id: 'All', name: 'Toate', count: programs.length },
        ...activeCats.map(cat => ({
          id: cat.name,
          name: cat.name,
          count: programs.filter(p => matchesCategoryName(p, cat.name)).length
        }))
      ];
    }

    const cats = new Set(programs.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)].map(cat => ({
      id: cat,
      name: cat === 'All' ? 'Toate' : cat,
      count: cat === 'All' ? programs.length : programs.filter(p => p.category === cat).length
    }));
  }, [programs, dbProgramCategories]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const pCat = p.category || '';
      const matchesCategory = selectedCategory === 'All' || 
                            pCat.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(channelSearchQuery.toLowerCase()) || 
                            p.description?.toLowerCase().includes(channelSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [programs, selectedCategory, channelSearchQuery]);

  useEffect(() => {
    api.getPrograms().then((d_progs) => {
      setSchedules(d_progs.filter((p: any) => p.status === 'online'));
      setLoadingSchedules(false);
    });
    api.getProgramCategories().then((cats) => {
      setDbProgramCategories(cats);
    }).catch(e => console.warn('Could not load program categories:', e));
    api.getHomepageConfig().then((d_conf) => {
      setConfig(d_conf);
    });
    api.getShows().then((d_shows) => {
      setShows(d_shows.sort((a: Show, b: Show) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
    try {
      const saved = localStorage.getItem('savedFavorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading favorites:', e);
    }
  }, []);

  useEffect(() => {
    const fetchLiveViewers = async () => {
      try {
        const res = await fetch('/api/presence/stats');
        if (res.ok) {
          const data = await res.json();
          const viewerMap: Record<string, number> = {};
          if (data && data.pageStats) {
            Object.entries(data.pageStats).forEach(([page, count]) => {
              if (page.startsWith('/play/')) {
                const progId = page.replace('/play/', '');
                viewerMap[progId] = Number(count);
              }
            });
          }
          setLiveViewers(viewerMap);
        }
      } catch (e) {
        console.warn('Failed to fetch live presence on home:', e);
      }
    };
    fetchLiveViewers();
    const interval = setInterval(fetchLiveViewers, 8000);
    return () => clearInterval(interval);
  }, []);

  const recentShows = shows.slice(0, 6);
  const favoritePrograms = useMemo(() => programs.filter(p => favorites.includes(p.id)), [programs, favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let next: string[];
    if (favorites.includes(id)) {
      next = favorites.filter(fid => fid !== id);
    } else {
      next = [...favorites, id];
    }
    setFavorites(next);
    localStorage.setItem('savedFavorites', JSON.stringify(next));
  };

  return (
    <div className={`transition-colors duration-300 min-h-screen ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Hero Showcase Section */}
      <section className="relative h-[55vh] min-h-[400px] flex items-center border-b border-slate-200/80 overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          {config?.heroBackgroundImage ? (
            <img src={config.heroBackgroundImage} alt="Promo" className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1593789382576-54f489cea515?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-white mb-4 shadow-md uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>TRANSMISIUNE TV ONLINE HD</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-md leading-[1.15]">
              {config?.heroTitle || 'programetv.online'}
            </h1>
            <p className="text-base text-slate-300 mb-8 line-clamp-2 leading-relaxed max-w-xl font-medium">
              {config?.heroSubtitle || 'Urmărește canalele TV românești și internaționale preferate, transmisiuni în direct și emisiuni la calitate înaltă.'}
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="#canale" 
                onClick={(e) => { e.preventDefault(); document.getElementById('canale')?.scrollIntoView({ behavior: 'smooth' }); }} 
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-xl font-black shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-300 text-sm cursor-pointer"
              >
                <Play fill="currentColor" className="w-4 h-4 ml-0.5" />
                <span>Vezi Canalele Live</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 space-y-16">

        {/* Favorite Channels Section */}
        {favoritePrograms.length > 0 && (
          <section className="animate-fade-in scroll-mt-24">
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-3">
                <Heart fill="currentColor" className="w-6 h-6 text-rose-500 animate-pulse" />
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Canale Favorite
                </h2>
              </div>
              <span className={`text-xs font-bold font-mono px-3 py-1 rounded-lg ${isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-slate-200/80 text-slate-700'}`}>
                {favoritePrograms.length} {favoritePrograms.length === 1 ? 'canal' : 'canale'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoritePrograms.map((p) => {
                const viewers = liveViewers[p.id] || 0;
                return (
                  <motion.div
                    key={`fav-${p.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link 
                      to={`/play/${p.id}`} 
                      className={`group relative block aspect-video rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-md ${
                        isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-200/90 hover:border-rose-400'
                      }`}
                    >
                      <img 
                        src={p.thumbnail} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        loading="lazy" 
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=312e81&color=fff&size=500` }} 
                      />

                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-md rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md cursor-pointer z-10"
                        title="Șterge de la favorite"
                      >
                        <Heart fill="currentColor" className="w-4 h-4" />
                      </button>

                      <div className="absolute top-3 left-3 pointer-events-none">
                        <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-md rounded-lg text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                          {p.category}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col justify-end pointer-events-none">
                        <h3 className="font-extrabold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                          {p.title}
                        </h3>
                        <div className="flex items-center text-[10px] text-rose-400 font-bold mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-ping" />
                          {viewers > 1 ? `${viewers} live acum` : 'Transmisiune HD'}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured Channels Section */}
        {programs.filter(p => p.isFeatured).length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <h2 className={`text-2xl font-black tracking-tight flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Star className="w-6 h-6 mr-2.5 text-amber-500 fill-amber-500/10" /> Transmisiuni Recomandate
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {programs.filter(p => p.isFeatured).map(p => (
                <Link key={p.id} to={`/play/${p.id}`} className={`group relative block aspect-video rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-md ${
                  isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-200/90 hover:border-amber-400'
                }`}>
                  <img src={p.thumbnail} alt={`Logo canal ${p.title}`} title={`${p.title} Live`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=f59e0b&color=fff&size=500` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none"></div>
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-rose-600 rounded-lg text-[9px] font-black tracking-widest text-white flex items-center shadow-md uppercase">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                      LIVE
                    </span>
                    <span className="px-2.5 py-1 bg-amber-500 rounded-lg text-[9px] font-black tracking-widest text-slate-950 flex items-center shadow-md uppercase">
                      RECOMANDAT
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <h3 className="text-white font-black text-base leading-tight group-hover:text-amber-300 transition-colors drop-shadow-md">
                       {p.title}
                    </h3>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-xl">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* In-Page Ad Banner Zone */}
        <AdBanner zoneId="11835805" format="leaderboard" className="my-8" />

        {/* Canale Live Grid */}
        <section id="canale" className="scroll-mt-24">
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 pb-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
            <div>
              <div className="inline-flex items-center space-x-2 text-rose-600 font-black uppercase tracking-wider text-xs mb-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <span>EMISIE DIRECTĂ ACUM</span>
              </div>
              <h2 className={`text-3xl font-black tracking-tight flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Radio className="w-8 h-8 mr-3 text-indigo-600 animate-pulse" /> Canale TV Live
              </h2>
            </div>

            {/* Quick Local Search Box */}
            <div className="relative w-full lg:max-w-xs shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Caută canal TV (ex. ProTV, Antena)..."
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 border ${
                  isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-indigo-500' 
                    : 'bg-white border-slate-200/90 text-slate-800 placeholder-slate-400 focus:border-indigo-600 shadow-xs'
                }`}
              />
              {channelSearchQuery && (
                <button 
                  onClick={() => setChannelSearchQuery('')} 
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-200 relative select-none cursor-pointer border ${
                    isActive 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]' 
                      : isDark
                        ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-xs'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{cat.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${isActive ? 'bg-white/20 text-white' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'}`}>
                      {cat.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Channels Grid / Skeletons */}
          {loadingSchedules ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`aspect-video w-full rounded-2xl border animate-pulse relative overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                  <div className="absolute inset-x-0 bottom-4 left-4 right-4 space-y-2">
                    <div className={`h-3 w-16 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                    <div className={`h-5 w-32 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl p-8 max-w-lg mx-auto border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <Tv className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>Niciun canal găsit</h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Nu s-a găsit niciun canal TV care să corespundă căutării Tale.</p>
              {(selectedCategory !== 'All' || channelSearchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setChannelSearchQuery('');
                  }}
                  className={`px-4 py-2 border rounded-xl text-xs font-black transition-colors ${
                    isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Resetează Filtrele
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPrograms.map((p) => {
                const realCount = liveViewers[p.id] || 0;
                const computedViewers = getCalculatedLiveViewers(p.id, p.title, p.category, p.rating, realCount);
                const formattedCount = formatViewerCount(computedViewers);
                const isItemFav = favorites.includes(p.id);
                return (
                  <motion.div
                    key={p.id}
                    layoutId={`chan-${p.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className={`group relative block aspect-video rounded-2xl overflow-hidden transition-all duration-300 border shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-zinc-900 border-zinc-800 hover:border-indigo-500/50' 
                          : 'bg-white border-slate-200/90 hover:border-indigo-400'
                      }`}
                    >
                      <Link to={`/play/${p.id}`} className="absolute inset-0 w-full h-full z-0">
                        <img 
                          src={p.thumbnail} 
                          alt={`Logo / Poster TV - ${p.title}`} 
                          title={p.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          loading="lazy" 
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=312e81&color=fff&size=500` }} 
                        />
                      </Link>

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-xl transition-all duration-200 shadow-md cursor-pointer z-20 ${
                          isItemFav 
                            ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105' 
                            : 'bg-slate-950/70 backdrop-blur-md text-slate-200 hover:text-white hover:bg-slate-950'
                        }`}
                        title={isItemFav ? 'Șterge de la favorite' : 'Adaugă la favorite'}
                      >
                        <Heart fill={isItemFav ? 'currentColor' : 'none'} className="w-3.5 h-3.5" />
                      </button>

                      {/* Category badge */}
                      <div className="absolute top-3 left-3 flex items-center pointer-events-none z-10">
                        <span className="px-2.5 py-1 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg text-[9px] font-black text-indigo-300 uppercase tracking-widest shadow-xs">
                          {p.category}
                        </span>
                      </div>

                      {/* Live Viewers Badge */}
                      <div className="absolute top-3 right-12 z-10 pointer-events-none">
                        <span className="inline-flex items-center space-x-1 bg-slate-950/85 backdrop-blur-md border border-rose-500/30 px-2.5 py-1 rounded-lg text-[9px] font-black text-rose-400 shadow-xs uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <Users className="w-3 h-3 text-rose-400" />
                          <span>{formattedCount} live</span>
                        </span>
                      </div>

                      {/* Play Button hover reveal */}
                      <Link to={`/play/${p.id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 z-10">
                        <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-xl">
                          <Play fill="white" className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </Link>

                      {/* Info overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-3.5 pt-12 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col justify-end pointer-events-none z-10">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-black text-sm text-white group-hover:text-indigo-300 transition-colors truncate flex-1 pr-2">
                            {p.title}
                          </h3>
                          <div className="flex items-center text-[10px] text-amber-400 font-black shrink-0 bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30">
                            <Star fill="currentColor" className="w-3 h-3 mr-1 text-amber-400" />
                            {p.rating || '8.5'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-300">
                          {p.quality && (
                            <span className="px-1.5 py-0.5 bg-slate-900/90 rounded text-indigo-300 border border-slate-700">{p.quality} HD</span>
                          )}
                          <span className="flex items-center text-rose-400 ml-auto font-black">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1 animate-ping" />
                            {formattedCount} vizitatori
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Shows On Demand */}
        {recentShows.length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <h2 className={`text-2xl font-black tracking-tight flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                 <MonitorPlay className="w-6 h-6 mr-2.5 text-indigo-600" /> Emisiuni pe Demand
              </h2>
              <Link to="/shows" className={`flex items-center transition-colors text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'
              }`}>
                Vezi toate emisiunile <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {recentShows.map((show, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={show.id}>
                  <Link to={`/shows/${show.slug}`} className={`group block relative rounded-2xl overflow-hidden border transition-all aspect-[2/3] shadow-xs hover:shadow-md ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                      : 'bg-white border-slate-200 hover:border-indigo-400'
                  }`}>
                    {show.thumbnail ? (
                      <img 
                        src={show.thumbnail} 
                        alt={`Poster Emisiune TV - ${show.title}`} title={show.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(show.title)}&background=312e81&color=fff&size=500` }}
                      />
                    ) : (
                      <div className={`absolute inset-0 flex justify-center items-center font-black text-2xl ${
                        isDark ? 'bg-zinc-800 text-zinc-600' : 'bg-slate-100 text-slate-400'
                      }`}>{show.title[0]}</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-0 p-3.5 pointer-events-none">
                      <h3 className="text-sm font-extrabold text-white mb-0.5 group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {show.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
