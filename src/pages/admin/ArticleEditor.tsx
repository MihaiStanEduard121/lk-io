import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Save, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImage: '',
    status: 'draft' as 'draft'|'published',
    author: 'Admin',
    publishedAt: '',
    categoryId: '',
    isBreakingNews: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories);
    if (isEdit) {
      api.getArticle(id).then(data => {
        setFormData(data);
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
      const payload = { ...formData };
      if (payload.status === 'published' && !payload.publishedAt) {
        payload.publishedAt = new Date().toISOString();
      }

      if (isEdit) {
        await api.updateArticle(id, payload);
      } else {
        await api.createArticle(payload);
      }
      navigate('/adminadmin/news');
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editează Articol' : 'Adaugă Articol Nou'}</h1>
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
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Titlu Articol</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Conținut (Markdown suportat)</label>
              <textarea required name="content" value={formData.content} onChange={handleChange} rows={15} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm" placeholder="## Titlu..."></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Imagine Cover (URL / Upload)</label>
              <div className="flex space-x-2">
                <input name="coverImage" value={formData.coverImage} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'coverImage')} />
                </label>
              </div>
              {formData.coverImage && <img src={formData.coverImage} alt="cover" className="mt-2 h-32 w-auto rounded border border-zinc-700 object-cover" />}
            </div>
            
            <div className="md:col-span-2 flex items-center mt-4">
              <input type="checkbox" id="isBreakingNews" checked={formData.isBreakingNews} onChange={e => setFormData(p => ({...p, isBreakingNews: e.target.checked}))} className="w-5 h-5 rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="isBreakingNews" className="ml-3 text-zinc-300 font-medium font-bold text-rose-500">Marchează ca Breaking News</label>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white">
                <option value="draft">Ciornă</option>
                <option value="published">Publicat</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Categorie</label>
              <select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white">
                <option value="">Fără categorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Autor</label>
              <input name="author" value={formData.author} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
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
            {loading ? 'Se salvează...' : 'Salvează Articolul'}
          </button>
        </div>
      </form>
    </div>
  );
}
