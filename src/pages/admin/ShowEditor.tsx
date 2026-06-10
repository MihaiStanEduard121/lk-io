import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Save, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function ShowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    banner: '',
    isFeatured: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.getShow(id).then(data => {
        setFormData(prev => ({ ...prev, ...data }));
      });
    }
  }, [id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        await api.updateShow(id, formData);
      } else {
        await api.createShow(formData);
      }
      navigate('/adminadmin/shows');
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editează Emisiune' : 'Adaugă Emisiune Nouă'}</h1>
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
              <label className="block text-zinc-400 text-sm font-medium mb-2">Titlu</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Descriere</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Thumbnail (URL / Upload)</label>
              <div className="flex space-x-2">
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'thumbnail')} />
                </label>
              </div>
              {formData.thumbnail && <img src={formData.thumbnail} alt="thumb" className="mt-2 h-20 w-auto rounded border border-zinc-700 object-cover" />}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Banner (URL / Upload)</label>
              <div className="flex space-x-2">
                <input name="banner" value={formData.banner} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'banner')} />
                </label>
              </div>
              {formData.banner && <img src={formData.banner} alt="banner" className="mt-2 h-20 w-auto rounded border border-zinc-700 object-cover" />}
            </div>
            
            <div className="md:col-span-2 mt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isFeatured" 
                  checked={formData.isFeatured} 
                  onChange={handleChange} 
                  className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                />
                <span className="text-zinc-300 font-medium">Apare în Recomandate pe Homepage (Secțiunea Emisiuni)</span>
              </label>
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
            {loading ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </form>
    </div>
  );
}
