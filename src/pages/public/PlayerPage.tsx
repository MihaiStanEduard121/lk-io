import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { TVProgram } from '../../types';
import ReactPlayer from 'react-player';

const Player = ReactPlayer as any;
import Markdown from 'react-markdown';
import { Share2, Star, Eye, Tag, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function enhanceEmbedCode(embedCode: string | undefined): string {
  if (!embedCode) return '';
  let clean = embedCode;

  if (clean.includes('<iframe')) {
    // 1. Force referrerpolicy to "no-referrer" to strip our dynamic/preview host-based referrer headers
    if (clean.includes('referrerpolicy=')) {
      clean = clean.replace(/referrerpolicy="[^"]*"/gi, 'referrerpolicy="no-referrer"');
      clean = clean.replace(/referrerpolicy='[^']*'/gi, 'referrerpolicy="no-referrer"');
    } else {
      clean = clean.replace(/<iframe/gi, '<iframe referrerpolicy="no-referrer"');
    }

    // 2. Ensure wide-ranging permissions for stream players
    if (clean.includes('allow=')) {
      clean = clean.replace(/allow="[^"]*"/gi, 'allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; gamepad"');
      clean = clean.replace(/allow='[^']*'/gi, 'allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; gamepad"');
    } else {
      clean = clean.replace(/<iframe/gi, '<iframe allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; gamepad"');
    }

    // 3. Force allowing fullscreen
    if (!clean.toLowerCase().includes('allowfullscreen')) {
      clean = clean.replace(/<iframe/gi, '<iframe allowfullscreen="true"');
    }

    // 4. Remove any restrictive custom sandboxes that break third-party cookies or scripts needed to initialize the player
    if (clean.includes('sandbox=')) {
      clean = clean.replace(/sandbox="[^"]*"/gi, '');
      clean = clean.replace(/sandbox='[^']*'/gi, '');
    }
  }
  return clean;
}

export default function PlayerPage() {
  const { id } = useParams();
  const [program, setProgram] = useState<TVProgram | null>(null);
  const [recommendations, setRecommendations] = useState<TVProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liveViewers, setLiveViewers] = useState<number>(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getProgram(id || '')
       .then(async (data) => {
         setProgram(data);
         setLoading(false);
         
         // Fetch other programs in alignment with requirements
         try {
           const allProgs = await api.getPrograms();
           const filtered = allProgs
             .filter((p: any) => p.id !== id)
             .sort((a: any, b: any) => {
               if (a.category === data.category && b.category !== data.category) return -1;
               if (a.category !== data.category && b.category === data.category) return 1;
               return (b.views || 0) - (a.views || 0);
             })
             .slice(0, 6);
           setRecommendations(filtered);
         } catch (e) {
           console.warn('Could not fetch recommendations:', e);
         }
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
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-zinc-800 relative player-wrapper">
        {program.embedCode ? (
          <div 
            className="w-full h-full relative"
            dangerouslySetInnerHTML={{ __html: enhanceEmbedCode(program.embedCode) }}
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
          <h3 className="text-lg font-semibold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Recomandări</h3>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map(rec => (
                <Link
                  key={rec.id}
                  to={`/play/${rec.id}`}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-zinc-700/50 transition-all group"
                >
                  <div className="w-14 h-10 rounded-lg bg-zinc-950 flex items-center justify-center p-1.5 flex-shrink-0 relative overflow-hidden group-hover:scale-[1.03] transition-transform border border-zinc-800/80">
                    {rec.thumbnail ? (
                      <img 
                        src={rec.thumbnail} 
                        alt={rec.title} 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-600 truncate">{rec.title}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-300 group-hover:text-indigo-400 transition-colors truncate">
                      {rec.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-md truncate max-w-[100px]">
                        {rec.category}
                      </span>
                      {rec.status === 'online' ? (
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                          Live
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">Offline</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-500 text-center">Nicio recomandare momentan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
