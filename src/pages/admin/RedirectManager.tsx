import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, TrafficCone, Trash2, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

interface RedirectRule {
  id: string;
  sourcePath: string; // e.g. /canal-x
  destinationPath: string; // e.g. /play/pro-tv
  active: boolean;
}

export default function RedirectManager() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSource, setNewSource] = useState('');
  const [newDestination, setNewDestination] = useState('');

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'redirects'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as RedirectRule));
      setRedirects(list);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newSource || !newDestination) return;
    try {
      const rule = {
        sourcePath: newSource.startsWith('/') ? newSource : `/${newSource}`,
        destinationPath: newDestination.startsWith('/') || newDestination.startsWith('http') ? newDestination : `/${newDestination}`,
        active: true
      };
      await addDoc(collection(db, 'redirects'), rule);
      setNewSource('');
      setNewDestination('');
      fetchRedirects();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'redirects', id), { active: !current });
    fetchRedirects();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest redirect?')) {
      await deleteDoc(doc(db, 'redirects', id));
      fetchRedirects();
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Se încarcă regulile de redirect...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
          <TrafficCone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Redirect Management</h1>
          <p className="text-sm text-zinc-400">Configurează redirecționări SEO 301 pentru rute vechi.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><PlusCircle className="w-4 h-4 text-emerald-400"/> Adaugă Redirect Nou</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Calea Sursă (ex: /vechiul-link)</label>
            <input 
              type="text" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
              value={newSource}
              onChange={e => setNewSource(e.target.value)}
              placeholder="/canal-x"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Destinație (ex: /play/nou)</label>
            <input 
              type="text" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
              value={newDestination}
              onChange={e => setNewDestination(e.target.value)}
              placeholder="/play/canal-y"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4"/> Salvează
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-zinc-300">Sursă (Calea originală)</th>
              <th className="px-6 py-4 font-semibold text-zinc-300">Destinație</th>
              <th className="px-6 py-4 font-semibold text-zinc-300">Status</th>
              <th className="px-6 py-4 font-semibold text-zinc-300">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {redirects.map(rule => (
              <tr key={rule.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4 font-mono text-indigo-400">{rule.sourcePath}</td>
                <td className="px-6 py-4 font-mono text-zinc-300">{rule.destinationPath}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleActive(rule.id, rule.active)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${rule.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}
                  >
                    {rule.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {rule.active ? 'Activ' : 'Inactiv'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(rule.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {redirects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Niciun redirect configurat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
