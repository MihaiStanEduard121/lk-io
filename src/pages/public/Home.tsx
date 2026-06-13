import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { TVProgram, Article, Show, HomepageConfig } from '../../types';
import { Play, Star, Eye, AlertCircle, ChevronRight, MonitorPlay, Tv, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { WORLD_CUP_MATCHES, getMatchLiveStatus, getActiveTime } from './worldCupData';

export default function Home() {
  const [programs, setPrograms] = useState<TVProgram[]>([]);
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);
  const [liveViewers, setLiveViewers] = useState<Record<string, number>>({});

  useEffect(() => {
    api.getPrograms().then((d_progs) => {
      setPrograms(d_progs.filter((p: any) => p.status === 'online'));
      setLoadingPrograms(false);
    });
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

  return (
    <div>
      {breakingNews.length > 0 && (
         <div className="bg-rose-600 text-white py-2 overflow-hidden flex whitespace-nowrap border-b border-rose-700">
           <div className="flex animate-marquee items-center text-sm font-bold tracking-wider uppercase">
             {breakingNews.map((n, i) => (
                <Link key={n.id} to={`/news/${n.slug}`} className="flex items-center mx-8 hover:text-white/80 transition-colors">
                  <AlertCircle className="w-4 h-4 mr-2" /> BREAKING NEWS: {n.title}
                </Link>
             ))}
           </div>
         </div>
      )}

      {/* Hero Featured */}
      <section className="relative h-[70vh] flex items-center border-b border-zinc-900">
        <div className="absolute inset-0">
          {config?.heroBackgroundImage ? (
            <img src={config.heroBackgroundImage} alt="Promo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1593789382576-54f489cea515?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {config?.heroLink && (
              <div className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold text-white mb-4 shadow-lg shadow-indigo-500/20">
                PROMO LIVE
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-lg">
              {config?.heroTitle || 'programetv.online'}
            </h1>
            <p className="text-lg text-zinc-300 mb-8 line-clamp-3">
              {config?.heroSubtitle || 'Urmărește cele mai populare transmisiuni, meciuri și emisiuni live într-un singur loc.'}
            </p>
            <div className="flex items-center space-x-4">
              <Link to={config?.heroLink || '/#canale'} onClick={(e) => { if(!config?.heroLink) { e.preventDefault(); document.getElementById('canale')?.scrollIntoView({ behavior: 'smooth' }); } }} className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-colors">
                <Play fill="currentColor" className="w-5 h-5" />
                <span>Urmărește acum</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 space-y-24">

        {/* Cupa Mondială 2026 Recommended Highlight Section */}
        <section className="bg-gradient-to-r from-indigo-950/10 via-zinc-900/60 to-zinc-950/40 border border-zinc-850 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-zinc-800 pb-4 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-md text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
                🏆 RECOMANDAT • FIFA CUPA MONDIALĂ 2026
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Meciuri Recomandate în Direct</h2>
            </div>
            <Link to="/world-cup" className="inline-flex items-center space-x-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 transition-colors shrink-0">
              <span>Program & Clasamente complet</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORLD_CUP_MATCHES.slice(14, 17).map((match) => {
              const liveState = getMatchLiveStatus(match, getActiveTime());
              const flag1 = `https://flagcdn.com/w80/${match.team1Code}.png`;
              const flag2 = `https://flagcdn.com/w80/${match.team2Code}.png`;
              const pagePath = `/world-cup/${match.id}`;
              const matchViewers = liveViewers[pagePath] || (liveState.status === 'live' ? Math.floor(Math.random() * 45) + 85 : 0);

              return (
                <Link 
                  key={match.id} 
                  to={pagePath}
                  className="group block bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-750 p-5 rounded-2xl shadow-lg hover:scale-[1.01] transition-all relative overflow-hidden"
                >
                  {/* Status tag */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {liveState.status === 'live' ? (
                      <span className="flex items-center space-x-1.5 bg-red-650/15 border border-red-500/25 text-red-500 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider animate-pulse uppercase">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span>LIVE</span>
                      </span>
                    ) : liveState.status === 'finished' ? (
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">FINAL</span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono bg-amber-500/10 px-2 py-0.5 rounded">{match.time}</span>
                    )}
                  </div>

                  <span className="text-[10px] bg-zinc-900 font-extrabold text-zinc-400 px-2 py-1 rounded uppercase tracking-wider">Grupa {match.group}</span>

                  <div className="flex items-center justify-between my-5">
                    {/* Team 1 */}
                    <div className="flex flex-col items-center flex-1 text-center truncate pr-1">
                      <img src={flag1} alt={match.team1} className="w-11 h-7.5 object-contain rounded border border-zinc-850 bg-zinc-950 shadow-inner" referrerPolicy="no-referrer" />
                      <span className="text-xs font-bold text-zinc-300 mt-2 truncate max-w-[85px]">{match.team1}</span>
                    </div>

                    {/* Central Score or Versus */}
                    {liveState.status === 'scheduled' ? (
                      <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-center font-mono text-[10px] font-bold text-zinc-500 min-w-[65px] self-center">
                        <div>{match.date}</div>
                        <div className="text-amber-500 font-black mt-0.5">{match.time}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-w-[60px] self-center">
                        <div className="flex items-center space-x-2 font-mono text-xl font-extrabold text-white">
                          <span>{liveState.score1}</span>
                          <span className="text-zinc-650">:</span>
                          <span>{liveState.score2}</span>
                        </div>
                        {liveState.status === 'live' && (
                          <span className="text-[8px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">{liveState.liveMinute}</span>
                        )}
                      </div>
                    )}

                    {/* Team 2 */}
                    <div className="flex flex-col items-center flex-1 text-center truncate pl-1">
                      <img src={flag2} alt={match.team2} className="w-11 h-7.5 object-contain rounded border border-zinc-850 bg-zinc-950 shadow-inner" referrerPolicy="no-referrer" />
                      <span className="text-xs font-bold text-zinc-300 mt-2 truncate max-w-[85px]">{match.team2}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900/60 pt-3 flex items-center justify-between text-[10px] font-bold text-zinc-550 uppercase tracking-wider">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 text-indigo-400 mr-1 shrink-0" />
                      {matchViewers} spectatori
                    </span>
                    <span className="text-amber-500 group-hover:text-amber-400 font-black transition-colors">Play Player &gt;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        
        {/* Știri Recente */}
        {recentArticles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Ultimele Știri</h2>
              <Link to="/news" className="text-zinc-400 hover:text-white flex items-center transition-colors text-sm font-medium">
                Vezi toate știrile <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArticles.map((art, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={art.id}>
                  <Link to={`/news/${art.slug}`} className="group block h-full bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors flex flex-col">
                    {art.coverImage && (
                      <div className="aspect-video w-full overflow-hidden bg-zinc-950">
                        <img src={art.coverImage} alt={`Imagine stire - ${art.title}`} title={art.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(art.title)}&background=random&color=fff&size=500` }} />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs text-indigo-400 font-bold mb-2 uppercase">{new Date(art.publishedAt).toLocaleDateString()}</span>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">{art.title}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2 mt-auto">{art.content.replace(/<[^>]*>?/gm, '')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Emisiuni Recomandate / Featured */}
        {programs.filter(p => p.isFeatured).length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                <Star className="w-6 h-6 mr-3 text-yellow-500" /> Transmisiuni Recomandate
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {programs.filter(p => p.isFeatured).map(p => (
                <Link key={p.id} to={`/play/${p.id}`} className="group relative block aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all">
                  <img src={p.thumbnail} alt={`Logo canal ${p.title}`} title={`${p.title} Live`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=random&color=fff&size=500` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-1 bg-rose-600 rounded text-[10px] font-bold text-white flex items-center shadow-lg uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                      LIVE
                    </span>
                    <span className="px-2 py-1 bg-yellow-500 rounded text-[10px] font-bold text-black flex items-center shadow-lg uppercase tracking-wider">
                      RECOMANDAT
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-amber-400 transition-colors drop-shadow-md flex items-center gap-2">
                       {p.title}
                    </h3>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Canale Live */}
        <section id="canale">
          <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
              <Tv className="w-6 h-6 mr-3 text-indigo-500" /> Toate canalele live
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {programs.map(p => (
              <Link key={p.id} to={`/play/${p.id}`} className="group relative block aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all">
                <img src={p.thumbnail} alt={`Logo / Poster TV - ${p.title}`} title={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=random&color=fff&size=500` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                    <Play fill="white" className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-400">{p.category}</span>
                    <div className="flex items-center text-xs text-yellow-500 font-bold">
                      <Star fill="currentColor" className="w-3 h-3 mr-1" />
                      {p.rating}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{p.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center text-zinc-500">
                      <Eye className="w-3 h-3 mr-1" />
                      {(p.views || 0).toLocaleString()} vizualizări
                    </div>
                    {liveViewers[p.id] > 0 && (
                      <span className="flex items-center text-rose-500 font-semibold bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded-md text-[10px] animate-pulse">
                        <span className="w-1 h-1 rounded-full bg-rose-500 mr-1 animate-ping" />
                        {liveViewers[p.id]} live
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Emisiuni Recente */}
        {recentShows.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                 <MonitorPlay className="w-6 h-6 mr-3 text-indigo-500" /> Emisiuni pe Demand
              </h2>
              <Link to="/shows" className="text-zinc-400 hover:text-white flex items-center transition-colors text-sm font-medium">
                Vezi toate emisiunile <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Emisiuni Recomandate (daca exista) */}
            {recentShows.filter(s => s.isFeatured).length > 0 && (
              <div className="mb-8 p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <h3 className="text-lg font-bold text-indigo-400 mb-6 flex items-center">
                   <Star className="w-5 h-5 mr-2 text-indigo-400 fill-indigo-400/20" /> Selecția Editorului
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {recentShows.filter(s => s.isFeatured).map(s => (
                    <Link key={s.id} to={`/shows/${s.slug}`} className="group cursor-pointer">
                       <div className="aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden mb-3 ring-1 ring-zinc-800 group-hover:ring-indigo-500/50 transition-all shadow-lg relative">
                         <img src={s.thumbnail} alt={`Poster Emisiune - ${s.title}`} title={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.title)}&background=random&color=fff&size=500` }} />
                         <div className="absolute top-2 right-2 bg-indigo-600 rounded text-[10px] font-bold text-white px-2 py-1 shadow-md">FAVORIT</div>
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Play fill="currentColor" className="w-10 h-10 text-white" />
                         </div>
                       </div>
                       <h3 className="text-zinc-200 font-medium group-hover:text-white transition-colors line-clamp-1">{s.title}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {recentShows.filter(s => !s.isFeatured).map((show, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={show.id}>
                  <Link to={`/shows/${show.slug}`} className="group block relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:ring-2 hover:ring-indigo-500 transition-all aspect-[2/3] shadow-lg">
                    {show.thumbnail ? (
                      <img 
                        src={show.thumbnail} 
                        alt={`Poster Emisiune TV - ${show.title}`} title={show.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" loading="lazy" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(show.title)}&background=random&color=fff&size=500` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex justify-center items-center font-bold text-zinc-700">{show.title[0]}</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors drop-shadow-md">
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
