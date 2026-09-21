import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play, Bell, BellRing, Sparkles, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { TVProgram, TVScheduleItem } from '../types';
import { getUpcomingShows, UpcomingShowItem, getTodayBucharestString } from '../lib/tvScheduleUtils';
import { useReminders } from '../lib/useReminders';
import { api } from '../lib/api';

interface UpcomingTvSectionProps {
  channels: TVProgram[];
  customSchedule?: TVScheduleItem[];
  isDark: boolean;
}

export default function UpcomingTvSection({ channels, customSchedule = [], isDark }: UpcomingTvSectionProps) {
  const [upcoming, setUpcoming] = useState<UpcomingShowItem[]>([]);
  const { hasReminder, toggleReminder } = useReminders();
  const todayStr = useMemo(() => getTodayBucharestString(), []);

  useEffect(() => {
    let mounted = true;

    const fetchUpcoming = async () => {
      try {
        const epgUpcoming = await api.getUpcomingEPG(8);
        if (mounted && Array.isArray(epgUpcoming) && epgUpcoming.length > 0) {
          const mapped: UpcomingShowItem[] = epgUpcoming.map((item: any) => {
            const ch = channels.find(c => c.id === item.channelId);
            return {
              channelId: item.channelId,
              channelTitle: item.channelTitle || ch?.title || item.channelId,
              channelLogo: item.channelLogo || ch?.logo || ch?.thumbnail,
              title: item.title,
              description: item.description,
              startTime: item.startTime || item.startFormatted,
              endTime: item.endTime || item.endFormatted,
              minutesUntilStart: item.minutesUntilStart,
              category: item.category || ch?.category,
              image: item.image
            } as any;
          });
          setUpcoming(mapped);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch EPG upcoming, falling back to local calculation:', e);
      }

      if (mounted) {
        const items = getUpcomingShows(channels, customSchedule, 8);
        setUpcoming(items);
      }
    };

    fetchUpcoming();
    const interval = setInterval(fetchUpcoming, 25000); // refresh countdown every 25s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [channels, customSchedule]);

  if (upcoming.length === 0) return null;

  return (
    <section className="relative scroll-mt-24 mt-12 mb-12" id="urmeaza-la-tv">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${
        isDark ? 'border-zinc-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-500 font-bold uppercase tracking-wider text-xs mb-1">
            <Clock className="w-3.5 h-3.5 animate-spin-slow" />
            <span>În Următoarele Ore</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Urmează la TV
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
            Actualizat în timp real (Ghid EPG RO)
          </span>
        </div>
      </div>

      {/* Grid of Upcoming Shows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {upcoming.map((item: any) => {
          const isReminded = hasReminder(item.channelId, item.title, item.startTime, todayStr);

          return (
            <div
              key={`${item.channelId}-${item.title}-${item.startTime}`}
              className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden ${
                isDark 
                  ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              {item.image && (
                <div className="absolute right-0 top-0 bottom-0 w-28 opacity-10 pointer-events-none overflow-hidden">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="relative z-10">
                {/* Channel & Countdown Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                      {item.channelLogo ? (
                        <img src={item.channelLogo} alt={item.channelTitle} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-black">{item.channelTitle.slice(0, 3)}</span>
                      )}
                    </div>
                    <span className="text-xs font-black truncate text-slate-800 dark:text-zinc-200">
                      {item.channelTitle}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 font-mono ${
                    item.minutesUntilStart <= 15
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50'
                  }`}>
                    {item.minutesUntilStart <= 1 
                      ? 'Începe acum' 
                      : `în ${item.minutesUntilStart} min`}
                  </span>
                </div>

                {/* Show Title & Category */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block mb-0.5">
                    {item.category || 'Program TV'} • Ora {item.startTime}
                  </span>
                  <h4 className={`text-sm font-black line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-inherit flex items-center justify-between gap-2 relative z-10">
                <Link
                  to={`/ro/play/${item.channelId}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Vezi Canalul</span>
                </Link>

                <button
                  onClick={() => toggleReminder({
                    showTitle: item.title,
                    channelId: item.channelId,
                    channelTitle: item.channelTitle || item.channelId,
                    date: todayStr,
                    startTime: item.startTime
                  })}
                  className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    isReminded
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : isDark
                        ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={isReminded ? 'Memento activat' : 'Amintește-mi când începe'}
                >
                  {isReminded ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  <span className="text-[10px] hidden sm:inline">
                    {isReminded ? 'Setat' : 'Memento'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
