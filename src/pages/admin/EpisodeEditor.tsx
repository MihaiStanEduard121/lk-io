import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Save, AlertCircle, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function EpisodeEditor() {
  const { showId, episodeId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!episodeId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    episodeNumber: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.getEpisode(episodeId).then(data => {
        setFormData(data);
      });
    }
  }, [episodeId, isEdit]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'episodeNumber' ? parseInt(value)||1 : value }));
  };

  const handleUpload = async (e: any, field: string) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.uploadFile(file);
      setFormData(prev => ({ ...prev, [field]: res.url }));
    } catch (err: any) {
      setError(err.message || 'Eroare la upload');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.updateEpisode(episodeId, formData);
      } else {
        await api.createEpisode(showId!, formData);
      }
      navigate(`/admin/shows/${showId}/episodes`);
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <Link to={`/admin/shows/${showId}/episodes`} className="inline-flex items-center text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Înapoi la episoade
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editează Episod' : 'Adaugă Episod Nou'}</h1>
      </div>

      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/50 p-4 rounded-lg flex items-center text-rose-400">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2 flex gap-4">
               <div className="w-1/4">
                <label className="block text-zinc-400 text-sm font-medium mb-2">Nr. Episod</label>
                <input required type="number" name="episodeNumber" value={formData.episodeNumber} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="w-3/4">
                <label className="block text-zinc-400 text-sm font-medium mb-2">Titlu Episod</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Descriere</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Link Video (YouTube/Vimeo sau .mp4/.m3u8)</label>
              <input required name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="https://youtube.com/watch?v=..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Thumbnail Episod (opțional)</label>
              <div className="flex space-x-2">
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'thumbnail')} />
                </label>
              </div>
              {formData.thumbnail && <img src={formData.thumbnail} alt="thumb" className="mt-2 h-20 w-auto rounded border border-zinc-700 object-cover" />}
            </div>
            
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Se salvează...' : 'Salvează Episodul'}
          </button>
        </div>
      </form>
    </div>
  );
}
