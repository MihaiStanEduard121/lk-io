import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Episode, Show } from '../../types';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';

export default function EpisodeList() {
  const { showId } = useParams();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [show, setShow] = useState<Show | null>(null);

  const loadData = () => {
    if(!showId) return;
    api.getShow(showId).then(setShow);
    api.getEpisodes(showId).then(setEpisodes);
  };

  useEffect(() => {
    loadData();
  }, [showId]);

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest episod?')) {
      await api.deleteEpisode(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <Link to="/adminadmin/shows" className="inline-flex items-center text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Înapoi la emisiuni
      </Link>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Episoade</h1>
          <p className="text-zinc-500 font-medium">Emisiune: {show?.title}</p>
        </div>
        <Link 
          to={`/adminadmin/shows/${showId}/episodes/new`} 
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Adaugă Episod</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">#</th>
              <th className="px-6 py-4 font-medium">Titlu Episod</th>
              <th className="px-6 py-4 font-medium">Platformă</th>
              <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {episodes.map(p => (
              <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4 text-zinc-400 font-bold">{p.episodeNumber}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {p.thumbnail && <img src={p.thumbnail} alt="" className="w-12 h-12 object-cover rounded bg-zinc-800" />}
                    <div className="font-bold text-white truncate max-w-xs">{p.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {p.videoUrl.includes('youtube') ? 'YouTube' : p.videoUrl.includes('vimeo') ? 'Vimeo' : 'Direct'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link 
                    to={`/adminadmin/shows/${showId}/episodes/${p.id}`} 
                    className="inline-flex p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {episodes.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            Nu exista episoade incă.
          </div>
        )}
      </div>
    </div>
  );
}
