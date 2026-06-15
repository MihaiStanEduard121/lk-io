import { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { api } from '../../lib/api';
import { Show, Episode } from '../../types';
import ReactPlayer from 'react-player';
import { enhanceEmbedCode } from './PlayerPage';

const Player = ReactPlayer as any;
import { ArrowLeft, PlayCircle, MonitorPlay, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function ShowDetailPage() {
  const { slug } = useParams();
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useOutletContext<{ isDark: boolean }>();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getShow(slug!).then(async (data) => {
      setShow(data);
      if (data) {
        const eps = await api.getEpisodes(data.id);
        const sorted = eps.sort((a: Episode, b: Episode) => b.episodeNumber - a.episodeNumber);
        setEpisodes(sorted);
        if (sorted.length > 0) setActiveEpisode(sorted[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-bold">
        <div className="flex h-3 w-3 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </div>
        <span className={isDark ? 'text-zinc-550' : 'text-zinc-400'}>Se încarcă detaliile emisiunii...</span>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="h-screen flex items-center justify-center flex-col p-4 text-center">
        <ArrowLeft className="w-8 h-8 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-rose-550">Emisiunea nu a fost găsită</h3>
        <Link to="/shows" className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold">Înapoi la emisiuni</Link>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'} min-h-screen`}>
      {/* Featured Video Area */}
      <div className={`pt-16 border-b transition-colors duration-300 ${isDark ? 'bg-black border-zinc-900' : 'bg-white border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/shows" className={`inline-flex items-center text-xs font-bold uppercase tracking-wider mb-6 transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-indigo-650'}`}>
            <ArrowLeft className="w-4 h-4 mr-2 text-indigo-505" /> Toate emisiunile
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className={`w-full aspect-video rounded-2xl overflow-hidden shadow-2xl relative player-wrapper border ${isDark ? 'bg-zinc-900 border-zinc-850' : 'bg-slate-100 border-zinc-200/50'}`}>
                {activeEpisode ? (
                  activeEpisode.embedCode ? (
                    <div 
                      className="w-full h-full relative"
                      dangerouslySetInnerHTML={{ __html: enhanceEmbedCode(activeEpisode.embedCode) }}
                    />
                  ) : activeEpisode.videoUrl ? (
                    <Player 
                      url={activeEpisode.videoUrl} 
                      controls 
                      width="100%" 
                      height="100%" 
                      playing={false} 
                    />
                  ) : (
                    <div className="flex flex-col h-full items-center justify-center text-zinc-500 p-4">
                       <MonitorPlay className="w-16 h-16 mb-4 opacity-50 text-indigo-500" />
                       <p className="font-extrabold text-sm uppercase tracking-wider">Format Video indisponibil</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col h-full items-center justify-center text-zinc-500 p-4">
                     <MonitorPlay className="w-16 h-16 mb-4 opacity-50 text-indigo-400" />
                     <p className="font-semibold text-sm">Selectați un episod pentru a viziona</p>
                  </div>
                )}
              </div>
              
              <div className={`mt-6 border-b pb-6 ${isDark ? 'border-zinc-800/50' : 'border-zinc-200'}`}>
                <h1 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{show.title}</h1>
                {activeEpisode && (
                  <h2 className={`text-lg font-bold mb-4 flex items-center ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest mr-3">
                      Episod {activeEpisode.episodeNumber}
                    </span>
                    {activeEpisode.title}
                  </h2>
                )}
                <p className={`leading-relaxed max-w-3xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>
                  {activeEpisode?.description || show.description}
                </p>
              </div>
            </div>

            <div className={`lg:col-span-1 rounded-2xl p-4 max-h-[800px] overflow-y-auto border ${
              isDark ? 'bg-zinc-900/40 border-zinc-850' : 'bg-white border-zinc-200'
            }`}>
              <h3 className={`font-black text-xs uppercase tracking-widest mb-4 px-2 ${isDark ? 'text-zinc-300' : 'text-zinc-750'}`}>
                Episoade Disponibile ({episodes.length})
              </h3>
              <div className="space-y-3">
                {episodes.map(ep => (
                  <button 
                    key={ep.id}
                    onClick={() => { setActiveEpisode(ep); window.scrollTo(0, 0); }}
                    className={`w-full text-left flex items-start space-x-3 p-3 rounded-2xl transition-all cursor-pointer border ${
                      activeEpisode?.id === ep.id 
                        ? isDark 
                          ? 'bg-zinc-800 border-indigo-500' 
                          : 'bg-indigo-50/40 border-indigo-300'
                        : isDark
                          ? 'bg-transparent border-transparent hover:bg-zinc-800/40'
                          : 'bg-transparent border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative w-28 aspect-video rounded-xl bg-zinc-950 flex-shrink-0 overflow-hidden shadow-sm">
                      {ep.thumbnail ? (
                        <img src={ep.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : show.thumbnail ? (
                        <img src={show.thumbnail} alt="" className="w-full h-full object-cover opacity-60" />
                      ) : null}
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                        Ep. {ep.episodeNumber}
                      </div>
                      {activeEpisode?.id === ep.id && (
                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center backdrop-blur-[1px]">
                          <PlayCircle className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className={`text-sm font-bold truncate ${
                         activeEpisode?.id === ep.id 
                           ? isDark ? 'text-white font-extrabold' : 'text-indigo-650 font-extrabold' 
                           : isDark ? 'text-zinc-300' : 'text-zinc-700'
                       }`}>
                         {ep.title}
                       </h4>
                       <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center">
                         <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                         {new Date(ep.createdAt).toLocaleDateString('ro-RO')}
                       </p>
                    </div>
                  </button>
                ))}
                {episodes.length === 0 && (
                  <p className="text-zinc-500 text-sm px-2">Niciun episod adăugat momentan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
