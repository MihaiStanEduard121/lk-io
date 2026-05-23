import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Save, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';

export default function ProgramEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    streamUrl: '',
    embedCode: '',
    thumbnail: '',
    banner: '',
    status: 'offline' as 'online'|'offline',
    quality: 'HD' as 'SD'|'HD'|'4K',
    tags: '',
    views: 0,
    rating: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.getProgram(id).then(data => {
        setFormData({ ...data, tags: data.tags?.join(', ') || '' });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await api.updateProgram(id, payload);
      } else {
        await api.createProgram(payload);
      }
      navigate('/adminadmin/programs');
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editează Program' : 'Adaugă Program Nou'}</h1>
      </div>

      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/50 p-4 rounded-lg flex items-center text-rose-400">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center"><Video className="w-5 h-5 mr-2 text-indigo-400"/> Detalii Generale</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Titlu Program</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Descriere (Acceptă Markdown, Formatare text, Imagini)</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={10} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm" placeholder="### Generează o descriere uimitoare..."></textarea>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Categorie</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                <option>General</option>
                <option>Sport</option>
                <option>Filme</option>
                <option>Documentare</option>
                <option>Știri</option>
                <option>Muzică</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Tag-uri (separate prin virgulă)</label>
              <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="ex: sport, fotbal, live" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center"><ImageIcon className="w-5 h-5 mr-2 text-indigo-400"/> Media & Streaming</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Link Stream (M3U8 / MP4)</label>
              <input name="streamUrl" value={formData.streamUrl} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" placeholder="https://..." />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Cod Embed Player (Opțional)</label>
              <textarea name="embedCode" value={formData.embedCode} onChange={handleChange} rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm" placeholder="<iframe src=...></iframe"></textarea>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Thumbnail URL / Upload (din PC)</label>
              <div className="flex space-x-2">
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'thumbnail')} />
                </label>
              </div>
              {formData.thumbnail && <img src={formData.thumbnail} alt="thumb" className="mt-2 h-20 w-auto rounded border border-zinc-700 object-cover" />}
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Banner URL / Upload (din PC)</label>
              <div className="flex space-x-2">
                <input name="banner" value={formData.banner} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'banner')} />
                </label>
              </div>
              {formData.banner && <img src={formData.banner} alt="banner" className="mt-2 h-20 w-auto rounded border border-zinc-700 object-cover" />}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white">
                <option value="offline">Offline / Ascuns</option>
                <option value="online">Online / Public</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Calitate curentă</label>
              <select name="quality" value={formData.quality} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white">
                <option value="SD">SD</option>
                <option value="HD">HD</option>
                <option value="4K">4K</option>
              </select>
            </div>
             <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Rating Inițial</label>
              <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Vizualizări Bază</label>
              <input type="number" name="views" value={formData.views} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
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
            {loading ? 'Se salvează...' : 'Salvează Programul'}
          </button>
        </div>
      </form>
    </div>
  );
}
