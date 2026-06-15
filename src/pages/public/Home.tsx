import { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { TVProgram, Article, Show, HomepageConfig, ProgramCategory } from '../../types';
import { Play, Star, Eye, AlertCircle, ChevronRight, MonitorPlay, Tv, Users, Search, Activity, Sparkles, Radio, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useOutletContext } from 'react-router-dom';
import { getMatchLiveStatus, getActiveTime, WCMatch } from './worldCupData';

export default function Home() {
  const context = useOutletContext<{ theme?: string }>() || {};
  const theme = context.theme || 'dark';
  const isDark = theme === 'dark';

  const [programs, setSchedules] = useState<TVProgram[]>([]);
  const [dbProgramCategories, setDbProgramCategories] = useState<ProgramCategory[]>([]);
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [worldCupMatches, setWorldCupMatches] = useState<WCMatch[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);
  const [loadingWcMatches, setLoadingWcMatches] = useState(true);
  const [liveViewers, setLiveViewers] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categoriesList = useMemo(() => {
    // If we have categories stored in DB, let's map them
    if (dbProgramCategories && dbProgramCategories.length > 0) {
      // Map programs to matching DB categories. Since programs store category as a string name:
      // We will only include categories that have at least one online program (hiding empty categories)
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

    // Fallback: derive categories directly from the programs (if no db admin categories exist yet)
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
      setLoadingConfig(false);
    });
    api.getArticles().then((d_arts) => {
      setArticles(d_arts.filter((a: Article) => a.status === 'published').sort((a: Article, b: Article) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      setLoadingArticles(false);
    });
    api.getShows().then((d_shows) => {
      setShows(d_shows.sort((a: Show, b: Show) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoadingShows(false);
    });
    api.getWorldCupMatches().then((d_matches) => {
       setWorldCupMatches(d_matches);
       setLoadingWcMatches(false);
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
              } else if (page.startsWith('/world-cup/')) {
                viewerMap[page] = Number(count);
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

  const breakingNews = articles.filter(a => a.isBreakingNews);
  const recentArticles = articles.slice(0, 4);
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
    <div className={`transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'}`}>
      {breakingNews.length > 0 && (
         <div className="bg-rose-650 text-white py-2 overflow-hidden flex whitespace-nowrap border-b border-rose-750 font-medium">
           <div className="flex animate-marquee items-center text-sm font-bold tracking-wider uppercase">
             {breakingNews.map((n, i) => (
                <Link key={n.id} to={`/news/${n.slug}`} className="flex items-center mx-8 hover:text-white/80 transition-colors">
                  <AlertCircle className="w-4 h-4 mr-2" /> BREAKING NEWS: {n.title}
                </Link>
             ))}
           </div>
         </div>
      )}

      {/* Hero Featured - Cinematic visual regardless of page theme */}
      <section className="relative h-[65vh] flex items-center border-b border-zinc-900 overflow-hidden bg-black">
        <div className="absolute inset-0">
          {config?.heroBackgroundImage ? (
            <img src={config.heroBackgroundImage} alt="Promo" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1593789382576-54f489cea515?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {config?.heroLink && (
              <div className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-black tracking-widest text-white mb-4 shadow-lg shadow-indigo-500/20 uppercase">
                PROMO LIVE
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 drop-shadow-lg leading-[1.1]">
              {config?.heroTitle || 'programetv.online'}
            </h1>
            <p className="text-base text-zinc-350 mb-8 line-clamp-3 leading-relaxed">
              {config?.heroSubtitle || 'Watch the most popular live streams, matches, and shows in one place.'}
            </p>
            <div className="flex items-center space-x-4">
              <Link to={config?.heroLink || '/#canale'} onClick={(e) => { if(!config?.heroLink) { e.preventDefault(); document.getElementById('canale')?.scrollIntoView({ behavior: 'smooth' }); } }} className="flex items-center space-x-2 bg-indigo-600 border border-transparent text-white hover:bg-indigo-750 px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all duration-300">
                <Play fill="currentColor" className="w-4 h-4" />
                <span>Urmărește Acum</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 space-y-24">

        {/* World Cup 2026 Recommended Highlight Section */}
        <section className={`p-6 sm:p-8 rounded-3xl relative overflow-hidden transition-all duration-300 border ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-950/15 via-zinc-900/60 to-zinc-950/40 border-zinc-850 shadow-2xl' 
            : 'bg-gradient-to-br from-indigo-50/20 via-white to-slate-100/50 border-zinc-200/80 shadow-md'
        }`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b pb-4 gap-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-md text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
                🏆 RECOMANDAT • FIFA WORLD CUP 2026
              </div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Meciuri Recomandate Direct</h2>
            </div>
            <Link to="/world-cup" className={`inline-flex items-center space-x-1 border px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isDark 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white' 
                : 'bg-white border-zinc-250 text-zinc-640 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
            }`}>
              <span>Program și Clasament Complet</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingWcMatches ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-zinc-500 font-bold py-8">
                Se încarcă meciurile recomandate...
              </div>
            ) : worldCupMatches.slice(14, 17).map((match) => {
              const liveState = getMatchLiveStatus(match, getActiveTime());
              const flag1 = `https://flagcdn.com/w80/${match.team1Code}.png`;
              const flag2 = `https://flagcdn.com/w80/${match.team2Code}.png`;
              const pagePath = `/world-cup/${match.id}`;
              const matchViewers = liveViewers[pagePath] || 0;

              return (
                <Link 
                  key={match.id} 
                  to={pagePath}
                  className={`group block border p-5 rounded-2xl transition-all relative overflow-hidden ${
                    isDark 
                      ? 'bg-zinc-950/60 hover:bg-zinc-950 border-zinc-850 hover:border-zinc-750 shadow-lg' 
                      : 'bg-white hover:bg-slate-50/50 border-zinc-200/80 hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  {/* Status tag */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {liveState.status === 'live' ? (
                      <span className="flex items-center space-x-1.5 bg-red-650/15 border border-red-500/25 text-red-500 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider animate-pulse uppercase">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span>LIVE</span>
                      </span>
                    ) : liveState.status === 'finished' ? (
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>FINAL</span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider font-mono bg-amber-500/10 px-2 py-0.5 rounded">{match.time}</span>
                    )}
                  </div>

                  <span className={`text-[9px] font-extrabold px-2 py-1 rounded uppercase tracking-wider ${isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-slate-100 text-zinc-500'}`}>Grupa {match.group}</span>

                  <div className="flex items-center justify-between my-5">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center flex-1 text-center truncate pr-1">
                      <img src={flag1} alt={match.team1} className="w-11 h-7.5 object-contain rounded border border-zinc-200 shadow-inner bg-zinc-950" referrerPolicy="no-referrer" />
                      <span className={`text-xs font-bold mt-2 truncate max-w-[85px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{match.team1}</span>
                    </div>

                    {/* Central Score or Versus */}
                    {liveState.status === 'scheduled' ? (
                      <div className={`px-2.5 py-1 rounded-lg border text-center font-mono text-[10px] font-bold min-w-[70px] self-center ${
                        isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-500' : 'bg-slate-50 border-zinc-200 text-zinc-500'
                      }`}>
                        <div>{match.date}</div>
                        <div className="text-amber-500 font-extrabold mt-0.5">{match.time}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-w-[60px] self-center">
                        <div className={`flex items-center space-x-2 font-mono text-xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          <span>{liveState.score1}</span>
                          <span className={`font-semibold ${isDark ? 'text-zinc-650' : 'text-zinc-400'}`}>:</span>
                          <span>{liveState.score2}</span>
                        </div>
                        {liveState.status === 'live' && (
                          <span className="text-[8px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">{liveState.liveMinute}</span>
                        )}
                      </div>
                    )}

                    {/* Team 2 */}
                    <div className="flex flex-col items-center flex-1 text-center truncate pl-1">
                      <img src={flag2} alt={match.team2} className="w-11 h-7.5 object-contain rounded border border-zinc-200 shadow-inner bg-zinc-950" referrerPolicy="no-referrer" />
                      <span className={`text-xs font-bold mt-2 truncate max-w-[85px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{match.team2}</span>
                    </div>
                  </div>

                  <div className={`border-t pt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${isDark ? 'border-zinc-900/60 text-zinc-500' : 'border-slate-100 text-zinc-450'}`}>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 text-indigo-400 mr-1 shrink-0" />
                      {matchViewers} vizitatori
                    </span>
                    <span className="text-indigo-600 group-hover:text-indigo-500 font-black transition-colors">Vezi meci &gt;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bookmarked / Favorite Channels Section */}
        {favoritePrograms.length > 0 && (
          <section className="animate-fade-in scroll-mt-24">
            <div className={`flex items-center justify-between mb-8 pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex items-center space-x-3">
                <Heart fill="url(#pinkGradHome)" className="w-7 h-7 text-rose-500 animate-pulse" />
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Canalele Tale Favorite
                </h2>
              </div>
              <span className={`text-xs font-bold font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {favoritePrograms.length} {favoritePrograms.length === 1 ? 'canal salvat' : 'canale salvate'}
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
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link 
                      to={`/play/${p.id}`} 
                      className={`group relative block aspect-video rounded-2xl overflow-hidden ${
                        isDark ? 'bg-zinc-900/80 border-zinc-850 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-rose-350 shadow-sm'
                      } border transition-all shadow-md hover:-translate-y-1 duration-300`}
                    >
                      <img 
                        src={p.thumbnail} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05] opacity-85 group-hover:opacity-100" 
                        loading="lazy" 
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=1f1f23&color=a78bfa&size=500` }} 
                      />

                      {/* Remove Bookmark button */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-md cursor-pointer z-10"
                        title="Șterge de la favorite"
                      >
                        <Heart fill="currentColor" className="w-4 h-4" />
                      </button>

                      {/* Category badge */}
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <span className="px-2.5 py-0.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-850/60 rounded-md text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">
                          {p.category}
                        </span>
                      </div>

                      {/* Info Overlay inside dark gradient bottom */}
                      <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col justify-end pointer-events-none">
                        <h3 className="font-extrabold text-sm text-zinc-100 truncate group-hover:text-amber-400 transition-colors drop-shadow-sm">
                          {p.title}
                        </h3>
                        {viewers > 1 ? (
                          <div className="flex items-center text-[10px] text-rose-400 font-bold mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-ping" />
                            {viewers} live acum
                          </div>
                        ) : (
                          <div className="text-[9px] text-zinc-400 font-bold mt-1">
                            {p.quality || 'FULL HD'} Transmisiune
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            
            <svg width="0" height="0" className="hidden">
              <linearGradient id="pinkGradHome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </svg>
          </section>
        )}
        
        {/* Recent News */}
        {recentArticles.length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-8 border-b pb-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Ultimele Știri și Noutăți</h2>
              <Link to="/news" className={`flex items-center transition-colors text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-indigo-600'
              }`}>
                Vezi toate știrile <ChevronRight className="w-4 h-4 ml-1 text-indigo-500" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArticles.map((art, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={art.id}>
                  <Link to={`/news/${art.slug}`} className={`group flex flex-col h-full border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isDark ? 'bg-zinc-900/45 border-zinc-850 hover:border-zinc-700' : 'bg-white border-zinc-200/80 hover:border-indigo-200 shadow-sm hover:shadow-md'
                  }`}>
                    {art.coverImage && (
                      <div className="aspect-video w-full overflow-hidden bg-zinc-950 relative">
                        <img src={art.coverImage} alt={`Imagine stire - ${art.title}`} title={art.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(art.title)}&background=111827&color=6366f1&size=500` }} />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-[10px] text-indigo-500 font-extrabold mb-2 uppercase tracking-widest">{new Date(art.publishedAt).toLocaleDateString('ro-RO')}</span>
                      <h3 className={`text-base font-extrabold mb-2 group-hover:text-indigo-500 transition-colors line-clamp-2 leading-snug ${isDark ? 'text-white' : 'text-zinc-800'}`}>{art.title}</h3>
                      <p className={`text-xs line-clamp-2 mt-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>{art.content.replace(/<[^>]*>?/gm, '')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Shows Recomandate / Featured */}
        {programs.filter(p => p.isFeatured).length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-8 border-b pb-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h2 className={`text-2xl font-black tracking-tight flex items-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                <Star className="w-6 h-6 mr-3 text-amber-500 fill-amber-500/10 animate-bounce" /> Transmisiuni Recomandate
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {programs.filter(p => p.isFeatured).map(p => (
                <Link key={p.id} to={`/play/${p.id}`} className={`group relative block aspect-video rounded-2xl overflow-hidden border ${
                  isDark ? 'bg-zinc-900 border-zinc-850 hover:border-zinc-700 shrink-0' : 'bg-white border-zinc-200 hover:border-amber-400 shadow-sm shrink-0'
                } transition-all duration-300`}>
                  <img src={p.thumbnail} alt={`Logo canal ${p.title}`} title={`${p.title} Live`} className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 opacity-90 group-hover:opacity-100" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=f59e0b&color=fff&size=500` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent pointer-events-none"></div>
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 bg-rose-650 rounded-md text-[9px] font-black tracking-widest text-white flex items-center shadow-lg uppercase">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                      LIVE
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-500 rounded-md text-[9px] font-black tracking-widest text-black flex items-center shadow-lg uppercase">
                      RECOMANDAT
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <h3 className="text-white font-extrabold text-base leading-tight mb-1 group-hover:text-amber-400 transition-colors drop-shadow-md">
                       {p.title}
                    </h3>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Canale Live */}
        <section id="canale" className="scroll-mt-24">
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <div>
              <div className="inline-flex items-center space-x-2 text-rose-500 font-extrabold uppercase tracking-wider text-xs mb-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>EMISIE DIRECTĂ ACUM</span>
              </div>
              <h2 className={`text-3xl font-black tracking-tight flex items-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                <Radio className="w-8 h-8 mr-3 text-indigo-505 animate-pulse" /> Canale TV Live
              </h2>
            </div>

            {/* Quick Local Search Box */}
            <div className="relative w-full lg:max-w-xs shrink-0">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Caută canal TV (ex. ProTV, Antena)..."
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300 border ${
                  isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-indigo-550' 
                    : 'bg-white border-zinc-250 text-zinc-800 placeholder-zinc-400 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm'
                }`}
              />
              {channelSearchQuery && (
                <button 
                  onClick={() => setChannelSearchQuery('')} 
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-indigo-600'}`}
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 relative select-none cursor-pointer border ${
                    isActive 
                      ? 'bg-indigo-650 text-white border-transparent shadow-lg shadow-indigo-600/15 scale-[1.02]' 
                      : isDark
                        ? 'bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:bg-zinc-900 hover:text-white'
                        : 'bg-white text-zinc-650 border-zinc-200 hover:bg-slate-105 hover:text-zinc-900 shadow-sm'
                  }`}
                >
                  <span className="flex items-center space-x-1.5 animate-fade-in">
                    <span>{cat.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${isActive ? 'bg-white/20 text-white' : isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-zinc-500'}`}>
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
                <div key={i} className={`aspect-video w-full rounded-2xl border animate-pulse relative overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-850' : 'bg-slate-100 border-zinc-200'}`}>
                  <div className="absolute inset-x-0 bottom-4 left-4 right-4 space-y-2">
                    <div className={`h-3 w-16 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                    <div className={`h-5 w-32 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl p-8 max-w-lg mx-auto border ${isDark ? 'bg-zinc-900/10 border-zinc-850' : 'bg-slate-100/55 border-zinc-205'}`}>
              <Tv className="w-12 h-12 text-zinc-550 mx-auto mb-4" />
              <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Niciun canal găsit</h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Nu s-a găsit niciun canal TV care să corespundă criteriilor sau căutării actuale.</p>
              {(selectedCategory !== 'All' || channelSearchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setChannelSearchQuery('');
                  }}
                  className={`px-4 py-2 border rounded-xl text-xs font-black transition-colors ${
                    isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-805 hover:text-white text-zinc-300' : 'bg-white border-zinc-250 hover:bg-slate-50 text-zinc-650 shadow-sm'
                  }`}
                >
                  Resetează Filtrele
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPrograms.map((p) => {
                const viewers = liveViewers[p.id] || 0;
                const isItemFav = favorites.includes(p.id);
                return (
                  <motion.div
                    key={p.id}
                    layoutId={`chan-${p.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className={`group relative block aspect-video rounded-2xl overflow-hidden transition-all shadow-md duration-300 border ${
                        isDark 
                          ? 'bg-zinc-900/80 border-zinc-850 hover:border-zinc-700' 
                          : 'bg-white border-zinc-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Backlight glow effect on hover */}
                      <div className="absolute inset-x-0 -bottom-1 h-1/2 bg-indigo-500/0 group-hover:bg-indigo-500/10 blur-xl transition-all duration-300 pointer-events-none" />

                      <Link to={`/play/${p.id}`} className="absolute inset-0 w-full h-full z-0">
                        <img 
                          src={p.thumbnail} 
                          alt={`Logo / Poster TV - ${p.title}`} 
                          title={p.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05] opacity-80 group-hover:opacity-100" 
                          loading="lazy" 
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=111827&color=6366f1&size=500` }} 
                        />
                      </Link>

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-xl transition-all duration-300 shadow-md cursor-pointer z-10 ${
                          isItemFav 
                            ? 'bg-rose-500 text-white hover:bg-rose-600 scale-[1.05]' 
                            : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/85'
                        }`}
                        title={isItemFav ? 'Șterge de la favorite' : 'Adaugă la favorite'}
                      >
                        <Heart fill={isItemFav ? 'currentColor' : 'none'} className="w-3.5 h-3.5" />
                      </button>

                      {/* Top Overlay badging */}
                      <div className="absolute top-3 left-4 flex items-center pointer-events-none">
                        <span className="px-2.5 py-0.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-850/65 rounded-lg text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">
                          {p.category}
                        </span>
                      </div>

                      {/* Live Counter (Bottom Left hover) */}
                      <div className="absolute top-3 left-28 pointer-events-none z-10 max-w-[100px]">
                        {viewers > 1 ? (
                          <span className="inline-flex items-center text-rose-500 font-extrabold bg-rose-500/15 border border-rose-500/25 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-rose-500 mr-1 animate-ping" />
                            {viewers} live
                          </span>
                        ) : null}
                      </div>

                      {/* Play Button hover reveal trigger */}
                      <Link to={`/play/${p.id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 z-0">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/45 shadow-2xl">
                          <Play fill="white" className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </Link>

                      {/* Info overlay inside dark gradient bottom */}
                      <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col justify-end pointer-events-none z-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-extrabold text-sm text-zinc-100 group-hover:text-indigo-400 transition-colors drop-shadow-sm truncate flex-1 pr-4">
                            {p.title}
                          </h3>
                          <div className="flex items-center text-xs text-yellow-500 font-extrabold shrink-0">
                            <Star fill="currentColor" className="w-3 h-3 mr-1 text-amber-400" />
                            {p.rating || '8.5'}
                          </div>
                        </div>
                        {p.quality && (
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{p.quality} HD BROADCAST</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Shows Recente */}
        {recentShows.length > 0 && (
          <section>
            <div className={`flex items-center justify-between mb-8 border-b pb-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h2 className={`text-2xl font-black tracking-tight flex items-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                 <MonitorPlay className="w-6 h-6 mr-3 text-indigo-500" /> Emisiuni pe Demand
              </h2>
              <Link to="/shows" className={`flex items-center transition-colors text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-indigo-600'
              }`}>
                Vezi toate emisiunile <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Shows Recomandate (daca exista) */}
            {recentShows.filter(s => s.isFeatured).length > 0 && (
              <div className={`mb-8 p-6 rounded-2xl border ${
                isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/20 border-indigo-200 shadow-sm'
              }`}>
                <h3 className="text-sm font-black text-indigo-550 mb-6 flex items-center uppercase tracking-widest">
                   <Star className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" /> Editor's Pick
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {recentShows.filter(s => s.isFeatured).map(s => (
                    <Link key={s.id} to={`/shows/${s.slug}`} className="group cursor-pointer">
                       <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 ring-1 ring-zinc-200 group-hover:ring-indigo-500/50 transition-all shadow-lg relative bg-zinc-950">
                         <img src={s.thumbnail} alt={`Poster Emisiune - ${s.title}`} title={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.title)}&background=1f1f23&color=a78bfa&size=500` }} />
                         <div className="absolute top-2.5 right-2.5 bg-indigo-650 rounded-lg text-[9px] font-extrabold text-white px-2.5 py-1 shadow-md uppercase tracking-wider">FAVORIT</div>
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Play fill="currentColor" className="w-10 h-10 text-white" />
                         </div>
                       </div>
                       <h4 className={`text-sm font-bold truncate group-hover:text-indigo-500 transition-colors ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{s.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {recentShows.filter(s => !s.isFeatured).map((show, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={show.id}>
                  <Link to={`/shows/${show.slug}`} className={`group block relative rounded-2xl overflow-hidden border transition-all aspect-[2/3] ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-850 hover:border-zinc-750 hover:shadow-indigo-505 shadow-xl' 
                      : 'bg-white border-zinc-200 hover:border-indigo-250 hover:shadow-lg'
                  }`}>
                    {show.thumbnail ? (
                      <img 
                        src={show.thumbnail} 
                        alt={`Poster Emisiune TV - ${show.title}`} title={show.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 opacity-85 group-hover:opacity-100" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(show.title)}&background=312e81&color=fff&size=500` }}
                      />
                    ) : (
                      <div className={`absolute inset-0 flex justify-center items-center font-bold bg-gradient-to-br ${
                        isDark ? 'from-zinc-800 to-zinc-950 text-zinc-650' : 'from-slate-100 to-slate-200 text-slate-400'
                      }`}>{show.title[0]}</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
                      <h3 className="text-sm font-extrabold text-white mb-1 group-hover:text-indigo-300 transition-colors drop-shadow-sm line-clamp-2">
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
