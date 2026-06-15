import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Show } from '../../types';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ListVideo, Tv } from 'lucide-react';

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useOutletContext<{ isDark: boolean }>();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getShows().then(data => {
      setShows(data.sort((a: Show, b: Show) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-bold">
        <div className="flex h-3 w-3 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </div>
        <span className={isDark ? 'text-zinc-550' : 'text-zinc-400'}>Se încarcă emisiunile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <div className="flex items-center space-x-3 mb-10 pb-4 border-b border-zinc-200/20">
        <ListVideo className="w-8 h-8 text-indigo-500" />
        <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Emisiuni pe Demand</h1>
      </div>
      
      {shows.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl p-8 max-w-lg mx-auto border ${isDark ? 'bg-zinc-900/10 border-zinc-850' : 'bg-slate-100/50 border-zinc-200'}`}>
          <Tv className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Nu am găsit emisiuni</h3>
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-650'}`}>Momentan nu există emisiuni disponibile pe platformă.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {shows.map((show, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={show.id}
            >
              <Link to={`/shows/${show.slug}`} className={`group block relative rounded-2xl overflow-hidden border transition-all aspect-[2/3] ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-850 hover:border-zinc-755 hover:shadow-indigo-505 shadow-xl' 
                  : 'bg-white border-zinc-200 hover:border-indigo-250 hover:shadow-lg'
              }`}>
                {show.thumbnail ? (
                  <img 
                    src={show.thumbnail} 
                    alt={show.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(show.title)}&background=312e81&color=fff&size=500` }}
                  />
                ) : (
                  <div className={`absolute inset-0 flex justify-center items-center font-bold bg-gradient-to-br ${
                    isDark ? 'from-zinc-800 to-zinc-950 text-zinc-650' : 'from-slate-100 to-slate-200 text-slate-450'
                  }`}>{show.title[0]}</div>
                )}
                
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
                  <h2 className="text-base font-extrabold text-white mb-1 group-hover:text-indigo-300 transition-colors drop-shadow-sm line-clamp-2">
                    {show.title}
                  </h2>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
