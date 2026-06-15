import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ProgramCategory } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export default function ProgramCategoryList() {
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [name, setName] = useState('');

  const loadData = () => {
    api.getProgramCategories().then(setCategories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createProgramCategory({ name });
    setName('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această categorie? Acest lucru nu va șterge canalele asociate ei, dar le va lăsa fără categorie activă.')) {
      await api.deleteProgramCategory(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full" id="program-categories-container">
      <div className="mb-8" id="program-categories-header">
        <h1 className="text-3xl font-bold text-white" id="program-categories-title">Categorii Canale / Programe TV</h1>
        <p className="text-zinc-400 text-sm mt-1" id="program-categories-subtitle">Creați și gestionați categoriile folosite pentru gruparea și filtrarea canalelor TV în paginile publice.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8" id="program-categories-form-wrapper">
        <form onSubmit={handleAdd} className="flex gap-4" id="program-categories-form">
          <input 
             type="text" 
             id="program-category-input"
             value={name} 
             onChange={e => setName(e.target.value)} 
             placeholder="Nume categorie nouă (ex: Documentare, Sport, Muzică)..." 
             className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
          />
          <button type="submit" id="program-category-add-btn" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Adaugă
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden" id="program-categories-table-wrapper">
        <table className="w-full text-left text-sm" id="program-categories-table">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Nume Categorie</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {categories.map(c => (
              <tr key={c.id} id={`row-cat-${c.id}`} className="hover:bg-zinc-800/20">
                <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                <td className="px-6 py-4 text-zinc-400">{c.slug}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    id={`btn-del-cat-${c.id}`}
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="p-8 text-center text-zinc-500 font-medium" id="program-categories-empty">
            Nicio categorie de canal adăugată încă. Categoriile se vor folosi la editarea canalelor TV.
          </div>
        )}
      </div>
    </div>
  );
}
