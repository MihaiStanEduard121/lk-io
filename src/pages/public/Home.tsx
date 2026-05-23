import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { TVProgram, Article, Show, HomepageConfig } from '../../types';
import { Play, Star, Eye, AlertCircle, ChevronRight, MonitorPlay } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [programs, setPrograms] = useState<TVProgram[]>([]);
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveViewers, setLiveViewers] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      api.getPrograms(),
      api.getHomepageConfig(),
      api.getArticles(),
      api.getShows()
    ]).then(([d_progs, d_conf, d_arts, d_shows]) => {
      setPrograms(d_progs.filter((p: any) => p.status === 'online'));
      setConfig(d_conf);
      setArticles(d_arts.filter((a: Article) => a.status === 'published').sort((a: Article, b: Article) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      setShows(d_shows.sort((a: Show, b: Show) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
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

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;
  }

  const featured = programs.length > 0 ? programs[0] : null;
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
      {featured && (
        <section className="relative h-[70vh] flex items-center border-b border-zinc-900">
          <div className="absolute inset-0">
            <img src={config?.heroBackgroundImage || featured.banner} alt={featured.title} className="w-full h-full object-cover" />
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
              <div className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold text-white mb-4 shadow-lg shadow-indigo-500/20">
                LIVE ACUM
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-lg">
                {config?.heroTitle || featured.title}
              </h1>
              <p className="text-lg text-zinc-300 mb-8 line-clamp-3">
                {config?.heroSubtitle || featured.description.replace(/<[^>]*>?/gm, '').split('\n')[0]}
              </p>
              <div className="flex items-center space-x-4">
                <Link to={`/play/${featured.id}`} className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-colors">
                  <Play fill="currentColor" className="w-5 h-5" />
                  <span>Urmărește acum</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 space-y-24">
        
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
                        <img src={art.coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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

        {/* Canale Live */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Toate canalele live</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {programs.map(p => (
              <Link key={p.id} to={`/play/${p.id}`} className="group relative block aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all">
                <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
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
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {recentShows.map((show, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={show.id}>
                  <Link to={`/shows/${show.slug}`} className="group block relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:ring-2 hover:ring-indigo-500 transition-all aspect-[2/3] shadow-lg">
                    {show.thumbnail ? (
                      <img 
                        src={show.thumbnail} 
                        alt={show.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
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
