import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Article, Show, TVProgram } from '../../types';
import { PlayCircle, Tv, FileText, MonitorPlay } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{articles: Article[], shows: Show[], live: TVProgram[]}>({articles: [], shows: [], live: []});
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="h-screen flex items-center justify-center text-zinc-500">Se caută...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-white">Rezultate pentru "{query}"</h1>
      
      {results.live.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center"><Tv className="w-6 h-6 mr-2 text-rose-500"/> Live TV</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.live.map(p => (
              <Link key={p.id} to={`/play/${p.id}`} className="block relative aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-indigo-500">
                <img src={p.thumbnail} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                   <PlayCircle className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <span className="font-bold text-sm text-white">{p.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.articles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center"><FileText className="w-6 h-6 mr-2 text-indigo-500"/> Știri</h2>
          <div className="space-y-4">
            {results.articles.map(art => (
              <Link key={art.id} to={`/news/${art.slug}`} className="block bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800/80 transition-colors">
                <h3 className="font-bold text-lg text-white">{art.title}</h3>
                <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{art.content.replace(/<[^>]*>?/gm, '')}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.shows.length > 0 && (
        <div className="mb-12">
           <h2 className="text-2xl font-bold mb-6 flex items-center"><MonitorPlay className="w-6 h-6 mr-2 text-emerald-500"/> Emisiuni</h2>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {results.shows.map(show => (
              <Link key={show.id} to={`/shows/${show.slug}`} className="block relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-indigo-500">
                <img src={show.thumbnail} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <span className="font-bold text-sm text-white">{show.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.articles.length === 0 && results.live.length === 0 && results.shows.length === 0 && (
        <div className="text-zinc-500">Niciun rezultat găsit.</div>
      )}
    </div>
  );
}
