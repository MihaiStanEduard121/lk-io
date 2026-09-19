import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useOutletContext } from 'react-router-dom';
import { api } from '../../lib/api';
import { TVScheduleItem, TVProgram, ArticleCategory } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Tv, 
  Play, 
  Sparkles, 
  ChevronRight,
  Radio
} from 'lucide-react';
import { timeToMinutes, getCurrentTimeMinutes } from '../../lib/tvScheduleUtils';

export default function SchedulePage() {
  const context = useOutletContext<{ theme?: string; isDark?: boolean }>() || {};
  const isDark = context.isDark ?? (context.theme === 'dark');

  const [searchParams, setSearchParams] = useSearchParams();
  const initialChannel = searchParams.get('channel') || '';

  const [schedule, setSchedule] = useState<TVScheduleItem[]>([]);
  const [channels, setChannels] = useState<TVProgram[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(initialChannel);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.getSchedule(),
      api.getPrograms(),
      api.getCategories()
    ]).then(([schedData, progData, catsData]) => {
      setSchedule(schedData || []);
      setChannels(progData || []);
      setCategories(catsData || []);
      setLoading(false);
    }).catch(err => {
      console.warn('Error loading schedule page:', err);
      setLoading(false);
    });
  }, []);

  // Update selectedChannel if query param changes
  useEffect(() => {
    const chParam = searchParams.get('channel');
    if (chParam !== null && chParam !== selectedChannel) {
      setSelectedChannel(chParam);
    }
  }, [searchParams]);

  // Generate 7-day date selector strip (Yesterday, Today, Next 5 days)
  const dateStrip = useMemo(() => {
    const today = new Date();
    const dates = [];
    for (let i = -1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      let label = '';
      if (i === -1) label = 'Ieri';
      else if (i === 0) label = 'Azi';
      else if (i === 1) label = 'Mâine';
      else {
        label = d.toLocaleDateString('ro-RO', { weekday: 'short' });
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }
      const dayNum = d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
      dates.push({ iso, label, dayNum, isToday: i === 0 });
    }
    return dates;
  }, []);

  // Channel map for fast lookup
  const channelMap = useMemo(() => {
    const map: Record<string, TVProgram> = {};
    channels.forEach(c => {
      map[c.id.toLowerCase()] = c;
    });
    return map;
  }, [channels]);

  // Filtered items
  const currentMinutes = getCurrentTimeMinutes();
  const todayIso = new Date().toISOString().split('T')[0];

  const filteredSchedule = useMemo(() => {
    return schedule.filter(item => {
      // Date filter
      if (selectedDate && item.date !== selectedDate) return false;

      // Channel filter
      if (selectedChannel && (item.channelId || '').toLowerCase() !== selectedChannel.toLowerCase()) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const itemCat = ((item as any).category || '').toLowerCase();
        const chObj = channelMap[(item.channelId || '').toLowerCase()];
        const chCat = (chObj?.category || '').toLowerCase();
        if (itemCat !== selectedCategory.toLowerCase() && chCat !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const t = item.title.toLowerCase();
        const d = (item.description || '').toLowerCase();
        const c = (item.channelId || '').toLowerCase();
        if (!t.includes(q) && !d.includes(q) && !c.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  }, [schedule, selectedDate, selectedChannel, selectedCategory, searchQuery, channelMap]);

  // Distinct channel IDs present in schedule
  const availableChannelIds = useMemo(() => {
    const ids = new Set(schedule.map(s => s.channelId).filter(Boolean));
    return Array.from(ids) as string[];
  }, [schedule]);

  return (
    <div className={`min-h-screen transition-colors duration-200 py-10 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Ghid TV România</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Program TV
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Consultă grila de emisiuni pentru posturile tale preferate actualizată în timp real.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută emisiune, film, meci..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                isDark 
                  ? 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600 shadow-xs'
              }`}
            />
          </div>
        </div>

        {/* 1. Date Navigation Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {dateStrip.map(d => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                className={`flex flex-col items-center min-w-[85px] py-2 px-3 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.03]'
                    : isDark
                      ? 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {d.label}
                </span>
                <span className={`text-[10px] font-semibold mt-0.5 ${
                  isSelected ? 'text-white/80' : 'text-slate-400 dark:text-zinc-500'
                }`}>
                  {d.dayNum}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Channel Quick Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => {
              setSelectedChannel('');
              setSearchParams({});
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
              selectedChannel === ''
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
          >
            Toate Canalele ({availableChannelIds.length})
          </button>

          {availableChannelIds.map(chId => {
            const ch = channelMap[chId.toLowerCase()];
            const title = ch ? ch.title : chId;
            const isSelected = selectedChannel.toLowerCase() === chId.toLowerCase();

            return (
              <button
                key={chId}
                onClick={() => {
                  setSelectedChannel(chId);
                  setSearchParams({ channel: chId });
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
                }`}
              >
                {ch?.logo && (
                  <img src={ch.logo} alt={title} className="w-4 h-4 object-contain rounded-xs" />
                )}
                <span>{title}</span>
              </button>
            );
          })}
        </div>

        {/* Schedule List */}
        {loading ? (
          <div className="space-y-3 py-8">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`h-20 rounded-2xl border animate-pulse p-4 ${
                  isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-100 border-slate-200'
                }`} 
              />
            ))}
          </div>
        ) : filteredSchedule.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl border p-8 max-w-md mx-auto ${
            isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
              Niciun program găsit
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">
              Nu există emisiuni conform filtrelor selectate pentru această zi.
            </p>
            <button
              onClick={() => {
                setSelectedChannel('');
                setSearchQuery('');
                setSelectedCategory('All');
                setSearchParams({});
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Resetează Toate Filtrele
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedule.map((item, idx) => {
              const startM = timeToMinutes(item.time);
              const nextItem = filteredSchedule[idx + 1];
              const endM = (item as any).endTime 
                ? timeToMinutes((item as any).endTime)
                : nextItem ? timeToMinutes(nextItem.time) : startM + 60;

              const isToday = selectedDate === todayIso;
              const isNow = isToday && currentMinutes >= startM && currentMinutes < endM;
              const isPast = isToday && currentMinutes >= endM;

              const ch = channelMap[(item.channelId || '').toLowerCase()];
              const channelTitle = ch ? ch.title : item.channelId || 'Canal TV';

              return (
                <div
                  key={item.id || idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isNow
                      ? isDark
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                        : 'bg-indigo-50/80 border-indigo-300 shadow-sm ring-1 ring-indigo-300'
                      : isPast
                        ? isDark
                          ? 'bg-zinc-900/30 border-zinc-850 opacity-60'
                          : 'bg-slate-100/70 border-slate-200/70 opacity-65'
                        : isDark
                          ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                          : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
                  }`}
                >
                  {/* Left: Time and Program Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Time Slot Block */}
                    <div className="flex flex-col items-center justify-center w-16 sm:w-20 shrink-0 text-center pt-0.5">
                      <span className={`font-mono text-base sm:text-lg font-black tracking-tight ${
                        isNow 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.time}
                      </span>
                      {(item as any).endTime && (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                          până la {(item as any).endTime}
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Channel Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          {channelTitle}
                        </span>

                        {/* Live Status Badge */}
                        {isNow && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            ACUM ÎN DIRECT
                          </span>
                        )}

                        {/* Category */}
                        {(item as any).category && (
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                            • {(item as any).category}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-extrabold line-clamp-1 ${
                        isNow 
                          ? 'text-indigo-600 dark:text-indigo-300' 
                          : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Watch Channel Live button */}
                  {item.channelId && (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Link
                        to={`/play/${item.channelId}`}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isNow
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                            : isDark
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Vezi Canal Live</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
