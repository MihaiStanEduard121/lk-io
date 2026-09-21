import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, ChevronRight, Radio, Calendar, Sparkles } from 'lucide-react';
import { TVProgram, TVScheduleItem } from '../types';
import { getChannelLiveSchedule, ChannelLiveInfo } from '../lib/tvScheduleUtils';
import { api } from '../lib/api';

interface NowOnTvSectionProps {
  channels: TVProgram[];
  customSchedule?: TVScheduleItem[];
  isDark: boolean;
}

export default function NowOnTvSection({ channels, customSchedule = [], isDark }: NowOnTvSectionProps) {
  const [liveData, setLiveData] = useState<Record<string, ChannelLiveInfo>>({});
  const [epgData, setEpgData] = useState<Record<string, any>>({});
  const [currentClock, setCurrentClock] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Fetch real EPG live now/next
  useEffect(() => {
    let mounted = true;
    const fetchEpg = async () => {
      try {
        const liveList = await api.getLiveEPG();
        if (mounted && Array.isArray(liveList) && liveList.length > 0) {
          const map: Record<string, any> = {};
          liveList.forEach(item => {
            map[item.channelId] = item;
          });
          setEpgData(map);
        }
      } catch (e) {
        console.warn('Failed to fetch live EPG in NowOnTvSection:', e);
      }
    };

    fetchEpg();
    const interval = setInterval(fetchEpg, 30000); // refresh EPG live every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update clock and calculate fallback schedules
  useEffect(() => {
    const updateTimeAndSchedule = () => {
      const now = new Date();
      setCurrentClock(
        now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );

      const mapping: Record<string, ChannelLiveInfo> = {};
      channels.forEach(ch => {
        mapping[ch.id] = getChannelLiveSchedule(ch.id, customSchedule);
      });
      setLiveData(mapping);
    };

    updateTimeAndSchedule();
    const timer = setInterval(updateTimeAndSchedule, 15000);
    return () => clearInterval(timer);
  }, [channels, customSchedule]);

  // Main channels to feature prominently in "Acum la TV"
  const priorityIds = ['pro-tv', 'antena-1', 'digi-sport-1', 'kanal-d', 'digi24', 'hbo', 'digi-sport-2', 'prima-tv', 'tvr-1', 'pro-arena', 'national-geographic'];
  
  const displayChannels = channels
    .filter(ch => {
      if (filterCategory === 'All') return true;
      return (ch.category || '').toLowerCase() === filterCategory.toLowerCase();
    })
    .sort((a, b) => {
      const idxA = priorityIds.indexOf(a.id);
      const idxB = priorityIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    })
    .slice(0, 8); // Top 8 featured channels

  return (
    <section className="relative scroll-mt-24" id="acum-la-tv">
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${
        isDark ? 'border-zinc-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="inline-flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>În Direct Acum pe Posturile TV</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Acum la TV
          </h2>
        </div>

        {/* Live Clock & Schedule Link */}
        <div className="flex items-center gap-3">
          {currentClock && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentClock} (RO)</span>
            </div>
          )}

          <Link
            to="/schedule"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>Ghid TV Complet</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {['All', 'Generalist', 'Sport', 'Știri', 'Filme', 'Documentare'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              filterCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : isDark
                  ? 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 shadow-xs'
            }`}
          >
            {cat === 'All' ? 'Toate Categoriile' : cat}
          </button>
        ))}
      </div>

      {/* Grid of "Acum la TV" Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {displayChannels.map(ch => {
          const epgItem = epgData[ch.id];
          const fallbackInfo = liveData[ch.id];
          
          // Use real EPG program first if present, otherwise fallback template
          const cur = epgItem?.currentProgram || fallbackInfo?.currentProgram;
          const nxt = epgItem?.nextProgram || fallbackInfo?.nextProgram;
          const progress = cur?.progressPercent || 50;
          const posterImg = cur?.image;

          return (
            <div
              key={ch.id}
              className={`group relative rounded-2xl border transition-all duration-200 p-4.5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isDark 
                  ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700' 
                  : 'bg-white border-slate-200/90 hover:border-indigo-300'
              }`}
            >
              {/* Channel Header */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                      {(ch.logo || ch.thumbnail) ? (
                        <img 
                          src={ch.logo || ch.thumbnail} 
                          alt={ch.title} 
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Radio className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {ch.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                        {ch.category || 'Generalist'}
                      </span>
                    </div>
                  </div>

                  {/* Live Indicator */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Current Program Block ("ACUM") */}
                <div className={`p-3 rounded-xl border mb-3 relative overflow-hidden ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  {posterImg && (
                    <div className="absolute right-0 top-0 bottom-0 w-24 opacity-15 pointer-events-none overflow-hidden">
                      <img src={posterImg} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-bold mb-1.5 relative z-10">
                    <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1 font-black">
                      <Sparkles className="w-3 h-3" /> ACUM
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400 font-mono">
                      {cur ? `${cur.startTime || cur.startFormatted} - ${cur.endTime || cur.endFormatted}` : 'În emisie directă'}
                    </span>
                  </div>

                  <p className={`text-xs font-black line-clamp-1 mb-2 relative z-10 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    {cur?.title || 'Transmisiune TV Live HD'}
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1 relative z-10">
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 dark:text-zinc-500">
                      <span>{progress}% parcurs</span>
                      <span>{cur?.remainingMinutes ? `încă ~${cur.remainingMinutes} min` : 'În curs'}</span>
                    </div>
                  </div>
                </div>

                {/* Up Next Program ("URMEAZĂ") */}
                {nxt && (
                  <div className="px-1 mb-4 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                        Urmează la {nxt.startTime || nxt.startFormatted}
                      </span>
                      <p className={`text-xs font-bold truncate ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        {nxt.title}
                      </p>
                    </div>
                    <Link
                      to={`/ro/schedule?channel=${ch.id}`}
                      className="text-slate-400 hover:text-indigo-500 shrink-0 p-1"
                      title="Ghid TV canal"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-inherit flex items-center gap-2">
                <Link
                  to={`/ro/play/${ch.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Urmărește Live</span>
                </Link>
                <Link
                  to={`/ro/schedule?channel=${ch.id}`}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                    isDark 
                      ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800' 
                      : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Vezi tot programul TV al acestui canal"
                >
                  <Calendar className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
