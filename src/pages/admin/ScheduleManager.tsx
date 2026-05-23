import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { TVScheduleItem } from '../../types';
import { Plus, Trash2, Calendar } from 'lucide-react';

export default function ScheduleManager() {
  const [schedule, setSchedule] = useState<TVScheduleItem[]>([]);
  const [formData, setFormData] = useState({ date: '', time: '', title: '', description: '' });

  const loadData = () => api.getSchedule().then(data => {
      const sorted = data.sort((a: any, b: any) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return a.time.localeCompare(b.time);
      });
      setSchedule(sorted);
  });

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createScheduleItem(formData);
    setFormData({ date: '', time: '', title: '', description: '' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur?')) {
      await api.deleteScheduleItem(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Gestionare Program TV</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Adaugă intrare nouă</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Data</label>
            <input type="date" required value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Ora (ex: 20:30)</label>
            <input type="time" required value={formData.time} onChange={e => setFormData(p => ({...p, time: e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-zinc-400 text-sm mb-1">Emisiune / Film</label>
            <input type="text" required value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500" />
          </div>
          <div className="md:col-span-4">
            <label className="block text-zinc-400 text-sm mb-1">Descriere scurtă (opțional)</label>
            <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500" rows={2}></textarea>
          </div>
          <div className="md:col-span-4 flex justify-end">
             <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center">
              <Plus className="w-5 h-5 mr-2" /> Adaugă în Program
            </button>
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Dată & Oră</th>
              <th className="px-6 py-4 font-medium">Informații</th>
              <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {schedule.map(c => (
              <tr key={c.id} className="hover:bg-zinc-800/20">
                <td className="px-6 py-4">
                   <div className="font-bold text-white">{c.date}</div>
                   <div className="text-zinc-500 font-mono">{c.time}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-indigo-400">{c.title}</div>
                  {c.description && <div className="text-zinc-400 text-xs mt-1 max-w-sm truncate">{c.description}</div>}
                </td>
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
      </div>
    </div>
  );
}
