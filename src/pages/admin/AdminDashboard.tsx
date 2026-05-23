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

  if (!stats) return <div className="p-8 text-zinc-500">Încărcare...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Programe', value: stats.totalPrograms, icon: Tv, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          { label: 'Programe TV Online', value: stats.onlinePrograms, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Vizualizări', value: (stats?.totalViews || 0).toLocaleString(), icon: Eye, color: 'text-sky-400', bg: 'bg-sky-400/10' },
          { label: 'Categorii', value: Object.keys(stats.categories).length, icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl"
          >
            <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <p className="text-zinc-400 font-medium text-sm mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <h2 className="text-lg font-bold mb-4 border-b border-zinc-800 pb-2">Distribuție pe Categorii</h2>
          <div className="space-y-4 pt-2">
            {Object.entries(stats.categories).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">{cat}</span>
                <span className="font-bold bg-zinc-800 px-3 py-1 rounded-md">{count as number} programe</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
