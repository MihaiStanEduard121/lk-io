import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AdminStats } from '../../types';
import { Activity, Tv, Users, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-slate-500 font-medium">Se încarcă...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panou Administrare</h1>
        <p className="text-sm text-slate-500 mt-1">Sumar de performanță și starea generală a platformei TV</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Programe', value: stats.totalPrograms, icon: Tv, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
          { label: 'Programe TV Online', value: stats.onlinePrograms, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Total Vizualizări', value: (stats?.totalViews || 0).toLocaleString(), icon: Eye, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
          { label: 'Categorii TV', value: Object.keys(stats.categories).length, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        ].map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            key={i} 
            className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl border ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <p className="text-slate-500 font-extrabold text-xs uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-3xl font-black text-slate-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
          <h2 className="text-base font-black text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Distribuție pe Categorii TV</span>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {Object.keys(stats.categories).length} categorii
            </span>
          </h2>
          <div className="space-y-3 pt-1">
            {Object.entries(stats.categories).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center text-sm p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-700">{cat}</span>
                <span className="font-mono text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg">
                  {count as number} programe
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
