import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Show } from '../../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ListVideo } from 'lucide-react';

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getShows().then(data => {
      setShows(data.sort((a: Show, b: Show) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <div className="flex items-center space-x-3 mb-10">
        <ListVideo className="w-8 h-8 text-indigo-500" />
        <h1 className="text-4xl font-bold text-white tracking-tight">Emisiuni pe Demand</h1>
      </div>
      
      {shows.length === 0 ? (
        <div className="text-zinc-500">Nu am găsit emisiuni disponibile.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {shows.map((show, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={show.id}
            >
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
                  <h2 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors drop-shadow-md">
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
