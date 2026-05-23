import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { TVProgram } from '../../types';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export default function ProgramList() {
  const [programs, setPrograms] = useState<TVProgram[]>([]);

  const loadPrograms = () => {
    api.getPrograms().then(setPrograms);
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest program?')) {
      await api.deleteProgram(id);
      loadPrograms();
    }
  };

  const toggleStatus = async (p: TVProgram) => {
    await api.updateProgram(p.id, { status: p.status === 'online' ? 'offline' : 'online' });
    loadPrograms();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Programe TV</h1>
        <Link 
          to="/admin/programs/new" 
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Adaugă Program</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Program</th>
              <th className="px-6 py-4 font-medium">Categorie</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Calitate</th>
              <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {programs.map(p => (
              <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <img src={p.thumbnail} alt="" className="w-16 h-9 object-cover rounded bg-zinc-800" />
                    <div>
                      <div className="font-bold text-white mb-0.5">{p.title}</div>
                      <div className="text-xs text-zinc-500">{p.views.toLocaleString()} viz.</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-400">{p.category}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(p)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      p.status === 'online' 
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' 
                        : 'border-zinc-700 text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800'
                    }`}
                  >
                    {p.status === 'online' ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {p.status.toUpperCase()}
                  </button>
                </td>
                <td className="px-6 py-4 text-zinc-400 font-medium">
                  {p.quality}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link 
                    to={`/admin/programs/${p.id}`} 
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
      </div>
    </div>
  );
}
