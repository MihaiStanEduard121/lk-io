import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ArticleCategory } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export default function CategoryList() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [name, setName] = useState('');

  const loadData = () => {
    api.getCategories().then(setCategories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createCategory({ name });
    setName('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur?')) {
      await api.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Categorii Articole</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
             type="text" 
             value={name} 
             onChange={e => setName(e.target.value)} 
             placeholder="Nume categorie nouă..." 
             className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Adaugă
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Nume</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-zinc-800/20">
                <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                <td className="px-6 py-4 text-zinc-400">{c.slug}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="p-8 text-center text-zinc-500">Nicio categorie încă.</div>
        )}
      </div>
    </div>
  );
}
