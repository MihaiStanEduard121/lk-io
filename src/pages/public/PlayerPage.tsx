import { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { api } from '../../lib/api';
import { TVProgram } from '../../types';
import ReactPlayer from 'react-player';

const Player = ReactPlayer as any;
import Markdown from 'react-markdown';
import { Share2, Star, Eye, Tag, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function enhanceEmbedCode(embedCode: string | undefined): string {
  if (!embedCode) return '';
  let clean = embedCode.trim();

  // If the user pasted a raw link instead of an iframe, auto-wrap or convert it
  const isUrl = /^https?:\/\/[^\s<>\"]+$/i.test(clean);
  if (isUrl) {
    const url = clean;
    if (url.includes('youtube.com/watch?v=') || url.includes('youtube.com/v/')) {
      const match = url.match(/(?:v=|v\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        clean = `<iframe src="https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1" frameborder="0"></iframe>`;
      }
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        clean = `<iframe src="https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1" frameborder="0"></iframe>`;
      }
    } else if (url.includes('vimeo.com/')) {
      const match = url.match(/vimeo\.com\/([0-9]+)/);
      if (match) {
        clean = `<iframe src="https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1" frameborder="0"></iframe>`;
      }
    } else if (url.includes('dailymotion.com/video/')) {
      const match = url.match(/video\/([a-zA-Z0-9]+)/);
      if (match) {
        clean = `<iframe src="https://www.dailymotion.com/embed/video/${match[1]}?autoplay=1&mute=1" frameborder="0"></iframe>`;
      }
    } else if (url.endsWith('.mp4') || url.endsWith('.mkv') || url.endsWith('.webm') || url.endsWith('.ogg')) {
      clean = `<video class="plyr-video w-full h-full" controls autoplay muted playsinline><source src="${url}">Your browser does not support video playback.</video>`;
    } else {
      // Wrap any unhandled raw URL as a fallback iframe
      clean = `<iframe src="${url}" frameborder="0"></iframe>`;
    }
  }

  // Optimize iframe tags for secure, responsive, full-screen playback
  if (clean.includes('<iframe')) {
    // 1. Force HTTPS Upgrade for security & mixed content prevention
    clean = clean.replace(/src="http:\/\//gi, 'src="https://');
    clean = clean.replace(/src='http:\/\//gi, "src='https://");

    // 2. Responsive Size adjustments: replace absolute width and height attributes with 100%
    clean = clean.replace(/width="[^"]*"/gi, 'width="100%"');
    clean = clean.replace(/width='[^']*'/gi, "width='100%'");
    clean = clean.replace(/height="[^"]*"/gi, 'height="100%"');
    clean = clean.replace(/height='[^']*'/gi, "height='100%'");

    // Also adjust inline style absolute coordinates if present
    clean = clean.replace(/style="[^"]*(width|height):\s*[0-9]+px[^"]*"/gi, (match) => {
      let res = match.replace(/(width):\s*[0-9]+px/gi, 'width: 100%');
      res = res.replace(/(height):\s*[0-9]+px/gi, 'height: 100%');
      return res;
    });

    // 3. Handle referrerpolicy to allow referer verification and prevent "Direct access blocked" errors
    if (clean.includes('referrerpolicy=')) {
      clean = clean.replace(/referrerpolicy="[^"]*"/gi, 'referrerpolicy="strict-origin-when-cross-origin"');
      clean = clean.replace(/referrerpolicy='[^']*'/gi, 'referrerpolicy="strict-origin-when-cross-origin"');
    } else {
      clean = clean.replace(/<iframe/gi, '<iframe referrerpolicy="strict-origin-when-cross-origin"');
    }

    // 4. Ensure required permissions and autoplay capabilities for stream/video players
    const correctAllow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    if (clean.includes('allow=')) {
      clean = clean.replace(/allow="[^"]*"/gi, `allow="${correctAllow}"`);
      clean = clean.replace(/allow='[^']*'/gi, `allow="${correctAllow}"`);
    } else {
      clean = clean.replace(/<iframe/gi, `<iframe allow="${correctAllow}"`);
    }

    // 5. Force allowing full-screen mode cleanly
    if (!clean.toLowerCase().includes('allowfullscreen')) {
      clean = clean.replace(/<iframe/gi, '<iframe allowfullscreen="true"');
    }

    // 6. Handle Sandbox Blockage (removing sandbox is safest to allow proper complex stream players to run cookie & script workflows)
    if (clean.includes('sandbox=')) {
      clean = clean.replace(/sandbox="[^"]*"/gi, '');
      clean = clean.replace(/sandbox='[^']*'/gi, '');
    }

    // 7. Dynamic Twitch Parent Resolution (Twitch embeds fail without the parent=DOMAIN query param)
    if (clean.includes('player.twitch.tv')) {
      try {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        // Extract the original src URL
        const srcMatch = clean.match(/src="([^"]+)"/i) || clean.match(/src='([^']+)'/i);
        if (srcMatch) {
          const originalSrc = srcMatch[1];
          let updatedSrc = originalSrc;
          
          if (!originalSrc.includes('parent=')) {
            const separator = originalSrc.includes('?') ? '&' : '?';
            updatedSrc = `${originalSrc}${separator}parent=${hostname}`;
          } else {
            // Replace existing parent param
            updatedSrc = originalSrc.replace(/parent=[a-zA-Z0-9\.\-_]+/gi, `parent=${hostname}`);
          }
          clean = clean.replace(originalSrc, updatedSrc);
        }
      } catch (e) {
        console.warn('Twitch parent URL parsing error:', e);
      }
    }

    // 8. Add lazy loading to ensure page load optimization
    if (!clean.toLowerCase().includes('loading=')) {
      clean = clean.replace(/<iframe/gi, '<iframe loading="lazy"');
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
  const { isDark } = useOutletContext<{ isDark: boolean }>();

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

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-bold">
        <div className="flex h-3 w-3 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </div>
        <span className={isDark ? 'text-zinc-550' : 'text-zinc-400'}>Se încarcă playerul...</span>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="h-screen flex items-center justify-center flex-col p-4 text-center">
        <ArrowLeft className="w-8 h-8 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-rose-550">Canalul TV nu a fost găsit</h3>
        <Link to="/" className="mt-4 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-wider">Mergi pe pagina principală</Link>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-zinc-900'} max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8`}>
      {/* Container Video */}
      <div className={`w-full aspect-video rounded-2xl overflow-hidden shadow-2xl relative player-wrapper border ${isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-slate-100 border-zinc-200'}`}>
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
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/60">
            <AlertCircle className="w-12 h-12 mb-4 text-indigo-500" />
            <p className="font-bold uppercase tracking-wider text-xs">Niciun flux live online disponibil</p>
          </div>
        )}
      </div>

      {/* Program Details */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{program.title}</h1>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link-ul canalului a fost copiat în clipboard!');
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white' 
                      : 'bg-white border-zinc-250 text-zinc-650 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Distribuie</span>
                </button>
              </div>
            </div>

            <div className={`flex flex-wrap items-center gap-4 text-xs mb-8 pb-8 border-b ${isDark ? 'border-zinc-800/50' : 'border-zinc-200'}`}>
              <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-wider">{program.category}</span>
              {program.quality && (
                <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-zinc-250 text-zinc-600'
                }`}>{program.quality}</span>
              )}
              <span className="flex items-center font-extrabold text-amber-500">
                <Star fill="currentColor" className="w-3.5 h-3.5 mr-1 text-amber-400" />
                {program.rating || '8.5'}
              </span>
              <span className={`flex items-center font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-550'}`}>
                <Eye className="w-4 h-4 mr-1 text-zinc-500" />
                {(program.views || 0).toLocaleString()} vizualizări
              </span>
              <span className="flex items-center text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 animate-ping" />
                {liveViewers} {liveViewers === 1 ? 'vizitator live' : 'vizitatori live'}
              </span>
            </div>

            <div className={`prose max-w-none text-sm leading-relaxed ${isDark ? 'prose-invert text-zinc-400' : 'text-zinc-650'}`}>
              <div className="markdown-body">
                <Markdown>{program.description}</Markdown>
              </div>
            </div>

            {program.tags && program.tags.length > 0 && (
              <div className={`mt-8 pt-8 border-t ${isDark ? 'border-zinc-800/50' : 'border-zinc-200'}`}>
                <div className="flex flex-wrap gap-2 items-center">
                  <Tag className="w-4 h-4 text-zinc-400 mr-2" />
                  {program.tags.map(tag => (
                    <span key={tag} className={`px-2.5 py-1 border rounded-full text-[10px] font-bold ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-zinc-200 text-zinc-500'
                    }`}>
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
          <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-2 ${isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-750 border-zinc-200'}`}>Recomandări</h3>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map(rec => (
                <Link
                  key={rec.id}
                  to={`/play/${rec.id}`}
                  className={`flex items-center space-x-3 p-2.5 rounded-2xl border transition-all group ${
                    isDark 
                      ? 'bg-zinc-900/50 hover:bg-zinc-800/80 border-zinc-850 hover:border-zinc-750' 
                      : 'bg-white hover:bg-slate-50/50 border-zinc-200 hover:border-indigo-250 shadow-sm'
                  }`}
                >
                  <div className={`w-14 h-10 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0 relative overflow-hidden group-hover:scale-[1.03] transition-transform border ${
                    isDark ? 'bg-zinc-950 border-zinc-850' : 'bg-slate-100 border-zinc-200 shadow-inner'
                  }`}>
                    {rec.thumbnail ? (
                      <img 
                        src={rec.thumbnail} 
                        alt={rec.title} 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-650 truncate">{rec.title}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold transition-colors truncate ${isDark ? 'text-zinc-300 group-hover:text-indigo-400' : 'text-zinc-700 group-hover:text-indigo-650'}`}>
                      {rec.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold truncate max-w-[100px] ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-zinc-500'}`}>
                        {rec.category}
                      </span>
                      {rec.status === 'online' ? (
                        <span className="text-[8px] text-emerald-500 font-extrabold uppercase tracking-wider flex items-center shrink-0">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                          Live
                        </span>
                      ) : (
                        <span className="text-[8px] text-zinc-550 shrink-0 uppercase tracking-wider font-semibold">Offline</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-100/50 border-zinc-200'}`}>
                <p className="text-xs text-zinc-500">Nicio recomandare momentan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
