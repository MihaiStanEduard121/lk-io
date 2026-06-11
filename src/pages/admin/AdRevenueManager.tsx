import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AdminStats } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, Eye, Percent, ArrowUpRight, TrendingUp, Download, Settings, Calculator, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdRevenueManager() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cpmRate, setCpmRate] = useState<number>(2.20); // Default CPM $2.20
  const [monetizationRate, setMonetizationRate] = useState<number>(85); // 85% traffic fill/multiplier
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-zinc-500">Se încarcă datele financiare...</div>;
  }

  const totalViews = stats?.totalViews || 0;
  // Calculate revenue: (Views * FillRate% * CPM) / 1000
  const estimatedRevenue = (totalViews * (monetizationRate / 100) * cpmRate) / 1000;
  
  // Calculate average revenue per page click
  const cpcRate = (cpmRate * (monetizationRate / 100)) / 1000;

  // Chart data simulation: Revenue over last 7 days based on current views distribution
  const chartData = [
    { name: 'Luni', vizualizari: Math.round(totalViews * 0.12), venit: (totalViews * 0.12 * (monetizationRate / 100) * cpmRate) / 1000 },
    { name: 'Marți', vizualizari: Math.round(totalViews * 0.15), venit: (totalViews * 0.15 * (monetizationRate / 100) * cpmRate) / 1000 },
    { name: 'Miercuri', vizualizari: Math.round(totalViews * 0.11), venit: (totalViews * 0.11 * (monetizationRate / 100) * cpmRate) / 1000 },
    { name: 'Joi', vizualizari: Math.round(totalViews * 0.14), venit: (totalViews * 0.14 * (monetizationRate / 100) * cpmRate) / 1000 },
    { name: 'Vineri', vizualizari: Math.round(totalViews * 0.18), venit: (totalViews * 0.18 * (monetizationRate / 100) * cpmRate) / 1000 },
    { name: 'Sâmbătă', vizualizari: Math.round(totalViews * 0.22), venit: (totalViews * 0.22 * (monetizationRate / 100) * cpmRate) / 1000 },
    { name: 'Duminică', vizualizari: Math.round(totalViews * 0.08), venit: (totalViews * 0.08 * (monetizationRate / 100) * cpmRate) / 1000 },
  ];

  // Category distribution data
  const categoryData = Object.entries(stats.categories || {}).map(([category, count]) => {
    // Simulate views per category (approximate: count * average views per program)
    const avgViews = totalViews / (stats.totalPrograms || 1);
    const categoryViews = Math.round((count as number) * avgViews);
    const categoryRev = (categoryViews * (monetizationRate / 100) * cpmRate) / 1000;
    return {
      name: category,
      programe: count,
      vizualizari: categoryViews,
      venit: categoryRev
    };
  });

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 opacity-90">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            <span>Statistici Venituri Ad Maven</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Raport detaliat al încasărilor estimate pe baza indicatorilor publici de trafic.
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 px-4 py-2 rounded-xl transition-all font-semibold text-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportă Raport</span>
        </button>
      </div>

      {/* Calculator & Controller Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl md:col-span-1 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center space-x-2 border-b border-zinc-850 pb-3">
            <Settings className="w-4 h-4 text-zinc-500" />
            <span>Configurare Ad Maven</span>
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-zinc-400 font-semibold">CPM Ad Maven ($)</span>
                <span className="text-indigo-400 font-extrabold">${cpmRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.05"
                value={cpmRate}
                onChange={(e) => setCpmRate(parseFloat(e.target.value))}
                className="w-full bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[10px] text-zinc-500 leading-none">Venit mediu generat la 1000 afișări de pagină.</span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-zinc-400 font-semibold">Rată Afișare Reclame (%)</span>
                <span className="text-emerald-400 font-extrabold">{monetizationRate}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={monetizationRate}
                onChange={(e) => setMonetizationRate(parseInt(e.target.value))}
                className="w-full bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-zinc-500 leading-none">Numărul mediu de amprente publicitare per vizualizare.</span>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Venit / Vizualizare:</span>
                <span className="text-zinc-300 font-mono">${cpcRate.toFixed(5)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-zinc-850/50 pt-2 font-bold">
                <span className="text-indigo-400">Rată Conversie CPM:</span>
                <span className="text-white font-mono">${(cpmRate * (monetizationRate/100)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Finance KPIs Overview */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Venit Total Estimat</p>
                <h2 className="text-4xl font-black text-white bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                  $ {estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-indigo-400/80 flex items-center font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              <span>Calculat pe baza vizualizărilor organice înregistrate în baza de date</span>
            </p>
          </div>

          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Vizualizări</p>
                <h2 className="text-4xl font-black text-white bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
                  {totalViews.toLocaleString()}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Eye className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-emerald-500/80 flex items-center font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Sursă date: Contor de vizualizari Programe TV</span>
            </p>
          </div>

          <div className="sm:col-span-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
            <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-widest">Evoluție Venituri Săptămânale (Proiecție)</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVenit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                    labelClassName="text-white font-extrabold"
                  />
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                  <Area type="monotone" dataKey="venit" name="Venit ($)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVenit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Categories table overview */}
      <h2 className="text-lg font-bold text-white mb-4">Venituri Estimate per Categorie Program</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-widest font-black border-b border-zinc-800/80">
            <tr>
              <th className="px-6 py-4">Categorie</th>
              <th className="px-6 py-4">Programe</th>
              <th className="px-6 py-4">Vizualizări (Aprox)</th>
              <th className="px-6 py-4 text-right">Venit Estimat ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {categoryData.map((cat, i) => (
              <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{cat.name}</td>
                <td className="px-6 py-4 text-zinc-400">
                  <span className="bg-zinc-800/60 px-2.5 py-1 rounded-md text-xs font-semibold text-zinc-300">
                    {cat.programe as number} emisiuni
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 font-mono">{cat.vizualizari.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-indigo-400">
                  $ {cat.venit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {categoryData.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">Nu s-au detectat categorii active.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
