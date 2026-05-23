import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Save, AlertCircle } from 'lucide-react';

export default function HomepageSettings() {
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBackgroundImage: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getHomepageConfig().then(data => {
      setFormData(data);
    });
  }, []);

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
    setSuccess('');

    try {
      await api.updateHomepageConfig(formData);
      setSuccess('Setările au fost salvate cu succes!');
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Setări Homepage</h1>
        <p className="text-zinc-400 mt-2">Personalizează aspectul primei pagini a site-ului.</p>
      </div>

      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/50 p-4 rounded-lg flex items-center text-rose-400">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-lg flex items-center text-emerald-400">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Hero Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Prolog (Hero Title)</label>
              <input required name="heroTitle" value={formData.heroTitle} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Subtitlu (Hero Subtitle)</label>
              <textarea required name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"></textarea>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Imagine Fundal (URL / Upload)</label>
              <div className="flex space-x-2">
                <input name="heroBackgroundImage" value={formData.heroBackgroundImage} onChange={handleChange} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white" />
                <label className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center">
                  <input type="file" className="hidden" onChange={e => handleUpload(e, 'heroBackgroundImage')} />
                  Încarcă
                </label>
              </div>
              {formData.heroBackgroundImage && <img src={formData.heroBackgroundImage} alt="hero bg" className="mt-4 h-40 w-full object-cover rounded border border-zinc-700 object-cover" />}
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
            {loading ? 'Se salvează...' : 'Salvează Setările'}
          </button>
        </div>
      </form>
    </div>
  );
}
