import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { TVProgram } from '../../types';
import ReactPlayer from 'react-player';

const Player = ReactPlayer as any;
import Markdown from 'react-markdown';
import { Share2, Star, Eye, Tag, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function PlayerPage() {
  const { id } = useParams();
  const [program, setProgram] = useState<TVProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liveViewers, setLiveViewers] = useState<number>(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getProgram(id || '')
       .then(data => {
         setProgram(data);
         setLoading(false);
       })
       .catch(() => {
         setError(true);
         setLoading(false);
       });
  }, [id]);

  useEffect(() => {
    const fetchLiveCount = async () => {
      try {
        const res = await fetch('/api/presence/stats');
        if (res.ok) {
          const stats = await res.json();
          const count = stats.pageStats[`/play/${id}`] || 1;
          setLiveViewers(count);
        }
      } catch (err) {
        console.warn('Could not fetch active viewers list', err);
      }
    };

    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 8000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;
  if (error || !program) return <div className="h-screen flex items-center justify-center text-rose-500">Programul nu a fost găsit.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Container Video */}
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-zinc-800">
        {program.embedCode ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: program.embedCode }}
          />
        ) : program.streamUrl ? (
          <Player 
             url={program.streamUrl} 
             controls 
             width="100%" 
             height="100%" 
             playing={true}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p>Niciun flux disponibil</p>
          </div>
        )}
      </div>

      {/* Program Details */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{program.title}</h1>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors border border-zinc-800">
                  <Share2 className="w-4 h-4" />
                  <span>Distribuie</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-800/50">
              <span className="px-2.5 py-1 bg-indigo-600/10 text-indigo-400 rounded-md font-semibold">{program.category}</span>
              {program.quality && (
                <span className="px-2.5 py-1 bg-zinc-800 rounded-md font-bold text-white">{program.quality}</span>
              )}
              <span className="flex items-center font-bold text-yellow-500">
                <Star fill="currentColor" className="w-4 h-4 mr-1" />
                {program.rating}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1 text-zinc-400" />
                {(program.views || 0).toLocaleString()} vizualizări
              </span>
              <span className="flex items-center text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 animate-ping" />
                {liveViewers} {liveViewers === 1 ? 'vizitator live' : 'vizitatori live'}
              </span>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="markdown-body">
                <Markdown>{program.description}</Markdown>
              </div>
            </div>

            {program.tags && program.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-zinc-800/50">
                <div className="flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-zinc-500 mr-2 mt-1" />
                  {program.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 border-b border-zinc-800 pb-2">Recomandări</h3>
          {/* A mock list for now */}
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <p className="text-sm text-zinc-400 text-center">In curând</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
