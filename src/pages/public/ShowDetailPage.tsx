import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  if (loading) return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;
  if (!show) return <div className="h-screen flex items-center justify-center text-rose-500">Emisiunea nu a fost găsită.</div>;

  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* Featured Video Area */}
      <div className="bg-black border-b border-zinc-900 w-full pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/shows" className="inline-flex items-center text-zinc-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Toate emisiunile
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-zinc-800 relative player-wrapper">
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
                      playing={true} 
                    />
                  ) : (
                    <div className="flex flex-col h-full items-center justify-center text-zinc-600">
                       <MonitorPlay className="w-16 h-16 mb-4 opacity-50" />
                       <p>Acest episod nu are asociat un format video redabil.</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col h-full items-center justify-center text-zinc-600">
                     <MonitorPlay className="w-16 h-16 mb-4 opacity-50" />
                     <p>Selectați un episod pentru a viziona</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 border-b border-zinc-800/50 pb-6">
                <h1 className="text-3xl font-bold text-white mb-2">{show.title}</h1>
                {activeEpisode && (
                  <h2 className="text-xl font-medium text-zinc-300 mb-4 flex items-center">
                    <span className="bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded text-sm font-bold mr-3">
                      Episod {activeEpisode.episodeNumber}
                    </span>
                    {activeEpisode.title}
                  </h2>
                )}
                <p className="text-zinc-400 leading-relaxed max-w-3xl">
                  {activeEpisode?.description || show.description}
                </p>
              </div>
            </div>

            <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 max-h-[800px] overflow-y-auto custom-scrollbar">
              <h3 className="font-bold text-lg text-white mb-4 px-2">Episoade Disponibile ({episodes.length})</h3>
              <div className="space-y-3">
                {episodes.map(ep => (
                  <button 
                    key={ep.id}
                    onClick={() => { setActiveEpisode(ep); window.scrollTo(0, 0); }}
                    className={`w-full text-left flex items-start space-x-3 p-3 rounded-xl transition-all ${
                      activeEpisode?.id === ep.id 
                        ? 'bg-zinc-800 ring-1 ring-indigo-500' 
                        : 'hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="relative w-28 aspect-video rounded bg-zinc-950 flex-shrink-0 overflow-hidden">
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
                       <h4 className={`text-sm font-bold truncate ${activeEpisode?.id === ep.id ? 'text-white' : 'text-zinc-300'}`}>
                         {ep.title}
                       </h4>
                       <p className="text-xs text-zinc-500 mt-1 flex items-center">
                         <Calendar className="w-3 h-3 mr-1" />
                         {new Date(ep.createdAt).toLocaleDateString()}
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
