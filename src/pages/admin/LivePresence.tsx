import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Radio, RefreshCw, Eye, Landmark, Globe, ShieldAlert, Save, CheckCircle } from 'lucide-react';

interface Session {
  clientId: string;
  page: string;
  isAdmin: boolean;
  secondsAgo: number;
}

interface PresenceStats {
  totalLive: number;
  adminLive: number;
  publicLive: number;
  pageStats: Record<string, number>;
  sessions: Session[];
}

export default function LivePresence() {
  const [stats, setStats] = useState<PresenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [maxLimit, setMaxLimit] = useState<number>(5);
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitSuccess, setLimitSuccess] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/presence/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch live presence stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLimit = async () => {
    try {
      const res = await fetch('/api/presence/config');
      const data = await res.json();
      if (typeof data.maxViewersPerPage === 'number') {
        setMaxLimit(data.maxViewersPerPage);
      }
    } catch (err) {
      console.error('Failed to fetch load limit config', err);
    }
  };

  const handleSaveLimit = async () => {
    setSavingLimit(true);
    setLimitSuccess(false);
    try {
      const res = await fetch('/api/presence/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: Number(maxLimit) })
      });
      const data = await res.json();
      if (data.success) {
        setLimitSuccess(true);
        setTimeout(() => setLimitSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save load limit config', err);
    } finally {
      setSavingLimit(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLimit();
    if (!autoRefresh) return;

    const interval = setInterval(fetchStats, 3000); // 3 seconds real-time update
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (!stats) {
    return (
      <div className="p-8 text-zinc-500 animate-pulse flex items-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
        Se încarcă datele de prezență în timp real...
      </div>
    );
  }

  // Helper to format path name
  const getPageLabel = (pathname: string) => {
    if (pathname === '/') return 'Acasă (Meniu Principal)';
    if (pathname.startsWith('/play/')) return `Player Video: ${pathname.replace('/play/', '')}`;
    if (pathname.startsWith('/news/')) return `Articol Noutăți / Știri`;
    if (pathname === '/news') return 'Pagina Știri / Articole';
    if (pathname === '/shows') return 'Emisiuni (VOD)';
    if (pathname.startsWith('/shows/')) return 'Detalii Emisiune';
    if (pathname === '/schedule') return 'Program TV';
    if (pathname === '/search') return 'Căutare';
    if (pathname.startsWith('/adminadmin/programs')) return 'Admin - Programe Live';
    if (pathname.startsWith('/adminadmin/news')) return 'Admin - Știri/Articole';
    if (pathname.startsWith('/adminadmin/shows')) return 'Admin - Emisiuni';
    if (pathname.startsWith('/adminadmin/scraper')) return 'Admin - Auto Scraper';
    if (pathname.startsWith('/adminadmin/live-presence')) return 'Admin - Utilizatori Live';
    if (pathname.startsWith('/adminadmin')) return 'Admin - Panou de Control';
    return pathname;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent flex items-center gap-3">
            <Radio className="w-8 h-8 text-emerald-500 animate-pulse" />
            Activitate Live pe Site
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Urmărește utilizatorii conectați în direct pe platformă. Datele se actualizează la fiecare {autoRefresh ? '3 secunde' : 'refresh'}.
          </p>
        </div>

        {/* Real-time controls */}
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center cursor-pointer bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 select-none">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
            />
            Auto-update
          </label>
          <button 
            onClick={fetchStats}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Live Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 flex items-center h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Vizitatori Live</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 tabular-nums">
                {stats.totalLive}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Public Live BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Vizitatori Publici</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 tabular-nums">
                {stats.publicLive}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Admin Live BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Admini Conectați</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 tabular-nums">
                {stats.adminLive}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle: All Current Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">Sesiuni Active în Direct</h3>
              <p className="text-xs text-zinc-500 mt-1">Dispozitive detectate recent pe site</p>
            </div>
            {stats.sessions.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                Niciun utilizator activ în acest moment. Pingește site-ul pentru a porni.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs text-zinc-400 font-semibold">
                      <th className="px-6 py-3.5">Identificator client</th>
                      <th className="px-6 py-3.5">Pagina Vizitată</th>
                      <th className="px-6 py-3.5">Rol</th>
                      <th className="px-6 py-3.5 text-right">Ultima activitate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {stats.sessions.map((session) => (
                      <motion.tr 
                        layout 
                        key={session.clientId} 
                        className="text-sm hover:bg-zinc-900/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-zinc-400 text-xs">
                          {session.clientId}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-200 block text-xs bg-zinc-950/50 px-2 py-1 rounded inline-block max-w-[280px] truncate" title={session.page}>
                            {session.page}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium block mt-1">
                            {getPageLabel(session.page)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {session.isAdmin ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-zinc-400 tabular-nums">
                          {session.secondsAgo === 0 ? 'acum' : `${session.secondsAgo} sec în urmă`}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Page Popularity / Breakdown */}
        <div className="space-y-4">
          {/* Limit and Protection settings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden animate-fade-in">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              Protecție Supra-solicitare
            </h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Limitează numărul maxim de vizitatori simultani permisi pe o singură pagină pentru a evita blocarea site-ului.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Limită vizitatori publici / pagină</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min={1} 
                    max={100}
                    value={maxLimit} 
                    onChange={e => setMaxLimit(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 text-center font-mono font-bold"
                  />
                  <button
                    onClick={handleSaveLimit}
                    disabled={savingLimit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    {savingLimit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Salvează
                  </button>
                </div>
              </div>
              
              {limitSuccess && (
                <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-1.5 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                  Limitarea de {maxLimit} vizitatori a fost activată!
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Popularitate Pagini în Timp Real
            </h3>
            
            {Object.keys(stats.pageStats).length === 0 ? (
              <div className="text-zinc-500 text-xs py-4 text-center">Niciun trafic înregistrat.</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.pageStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([page, count]) => {
                    const percentage = stats.totalLive > 0 ? (count / stats.totalLive) * 100 : 0;
                    return (
                      <div key={page} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-zinc-300 truncate max-w-[200px]" title={page}>
                            {page} <span className="text-zinc-500 font-normal">({getPageLabel(page)})</span>
                          </span>
                          <span className="text-zinc-400 tabular-nums font-semibold">{count} active</span>
                        </div>
                        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-indigo-500/10 rounded-xl p-5">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Cum funcționează?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Fiecare vizitator de pe site trimite automat un semnal cu o frecvență de 12 secunde către server. Dacă un vizitator nu mai trimite semnal timp de 30 de secunde (închide pagina sau își pierde conexiunea), acesta este șters automat din listă.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
