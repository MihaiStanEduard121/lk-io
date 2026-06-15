import { useEffect, useState } from 'react';
import { useSearchParams, Link, useOutletContext } from 'react-router-dom';
import { api } from '../../lib/api';
import { Article, Show, TVProgram } from '../../types';
import { PlayCircle, Tv, FileText, MonitorPlay, Film, ArrowRight } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{articles: Article[], shows: Show[], live: TVProgram[]}>({articles: [], shows: [], live: []});
  const [loading, setLoading] = useState(true);
  const { isDark } = useOutletContext<{ isDark: boolean }>();

  useEffect(() => {
    if (query) {
      setLoading(true);
      api.search(query).then(data => {
        setResults(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-bold">
        <div className="flex h-3 w-3 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </div>
        <span className={isDark ? 'text-zinc-550' : 'text-zinc-400'}>Se caută...</span>
      </div>
    );
  }

  const hasResults = results.articles.length > 0 || results.live.length > 0 || results.shows.length > 0;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 transition-colors duration-300 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
      <div className="mb-10 pb-4 border-b border-zinc-200/20">
        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-550 bg-indigo-500/10 px-2.5 py-1 rounded-md mb-2 inline-block">Rezultate Căutare</span>
        <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Rezultate pentru &ldquo;{query}&rdquo;</h1>
      </div>
      
      {results.live.length > 0 && (
        <div className="mb-12">
          <h2 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-zinc-800'}`}>
            <Tv className="w-5 h-5 mr-2.5 text-rose-500" /> Canale Live TV
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {results.live.map(p => (
              <Link 
                key={p.id} 
                to={`/play/${p.id}`} 
                className={`group block relative aspect-video rounded-2xl overflow-hidden border transition-all duration-300 shadow-md ${
                  isDark ? 'bg-zinc-900 border-zinc-855 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-indigo-300 hover:shadow-lg'
                }`}
              >
                <img 
                  src={p.thumbnail} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" 
                  onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=312e81&color=fff&size=500` }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <PlayCircle className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <span className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors">{p.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.shows.length > 0 && (
        <div className="mb-12">
           <h2 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-zinc-800'}`}>
             <MonitorPlay className="w-5 h-5 mr-2.5 text-indigo-500" /> Emisiuni pe Demand
           </h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {results.shows.map(show => (
              <Link 
                key={show.id} 
                to={`/shows/${show.slug}`} 
                className={`group block relative aspect-[2/3] rounded-2xl overflow-hidden border transition-all duration-300 shadow-md ${
                  isDark ? 'bg-zinc-900 border-zinc-855 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-indigo-250 hover:shadow-lg'
                }`}
              >
                <img 
                  src={show.thumbnail} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105" 
                  onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(show.title)}&background=1e1b4b&color=fff&size=500` }}
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent">
                  <span className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2">{show.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.articles.length > 0 && (
        <div className="mb-12">
          <h2 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-zinc-800'}`}>
            <FileText className="w-5 h-5 mr-2.5 text-indigo-400" /> Știri &amp; Articole
          </h2>
          <div className="space-y-4">
            {results.articles.map(art => (
              <Link 
                key={art.id} 
                to={`/news/${art.slug}`} 
                className={`group block border p-5 rounded-2xl transition-all duration-300 ${
                  isDark 
                    ? 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-850 hover:border-zinc-750' 
                    : 'bg-white border-zinc-200 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className={`font-extrabold text-base group-hover:text-indigo-500 transition-colors ${isDark ? 'text-white' : 'text-zinc-800'}`}>{art.title}</h3>
                  <span className="text-zinc-400 group-hover:translate-x-1 transition-transform pl-4 shrink-0 mt-1"><ArrowRight className="w-4 h-4 text-indigo-505" /></span>
                </div>
                <p className={`text-xs mt-2 line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{art.content.replace(/<[^>]*>?/gm, '')}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!hasResults && (
        <div className={`text-center py-20 rounded-2xl p-8 max-w-lg mx-auto border ${isDark ? 'bg-zinc-900/10 border-zinc-850' : 'bg-slate-100/50 border-zinc-200'}`}>
          <Film className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Niciun rezultat găsit</h3>
          <p className={`text-sm ${isDark ? 'text-zinc-550' : 'text-zinc-650'}`}>Nu am găsit nimic care să se potrivească cu termenul căutat. Încearcă alte cuvinte cheie.</p>
          <Link to="/" className="mt-6 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider">Mergi pe Acasă</Link>
        </div>
      )}
    </div>
  );
}
