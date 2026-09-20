import { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { TVProgram, Show, HomepageConfig, ProgramCategory, TVScheduleItem } from '../../types';
import { 
  Play, 
  Star, 
  Users, 
  Search, 
  Radio, 
  Heart, 
  ChevronRight, 
  MonitorPlay, 
  Tv, 
  Sparkles,
  LayoutGrid,
  List,
  ShieldCheck,
  Zap,
  CalendarDays,
  Clock,
  History,
  Share2,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useOutletContext } from 'react-router-dom';
import { getCalculatedLiveViewers, formatViewerCount } from '../../lib/viewerUtils';
import NowOnTvSection from '../../components/NowOnTvSection';
import UpcomingTvSection from '../../components/UpcomingTvSection';
import { useFavorites } from '../../lib/useFavorites';
import { useWatchHistory } from '../../lib/useWatchHistory';

export default function Home() {
  const context = useOutletContext<{ theme?: string; isDark?: boolean }>() || {};
  const isDark = context.isDark ?? (context.theme === 'dark');

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { history, clearHistory } = useWatchHistory();

  const [programs, setPrograms] = useState<TVProgram[]>([]);
  const [dbProgramCategories, setDbProgramCategories] = useState<ProgramCategory[]>([]);
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [scheduleItems, setScheduleItems] = useState<TVScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [liveViewers, setLiveViewers] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.getPrograms(),
      api.getProgramCategories(),
      api.getHomepageConfig(),
      api.getShows(),
      api.getSchedule()
    ]).then(([d_progs, cats, d_conf, d_shows, d_sched]) => {
      setPrograms(d_progs.filter((p: any) => p.status === 'online'));
      setDbProgramCategories(cats || []);
      setConfig(d_conf);
      setShows((d_shows || []).sort((a: Show, b: Show) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setScheduleItems(d_sched || []);
      setLoadingSchedules(false);
    }).catch(err => {
      console.warn('Error loading home data:', err);
      setLoadingSchedules(false);
    });
  }, []);

  // Poll live presence efficiently without unnecessary re-renders
  useEffect(() => {
    let prevStatsStr = '';
    const fetchLiveViewers = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch('/api/presence/stats');
        if (res.ok) {
          const data = await res.json();
          const viewerMap: Record<string, number> = {};
          if (data && data.pageStats) {
            Object.entries(data.pageStats).forEach(([page, count]) => {
              if (page.startsWith('/play/')) {
                const progId = page.replace('/play/', '');
                viewerMap[progId] = Number(count);
              }
            });
          }
          const newStr = JSON.stringify(viewerMap);
          if (newStr !== prevStatsStr) {
            prevStatsStr = newStr;
            setLiveViewers(viewerMap);
          }
        }
      } catch (e) {
        // Silently catch error
      }
    };

    fetchLiveViewers();
    const interval = setInterval(fetchLiveViewers, 15000);
    const handleVis = () => {
      if (!document.hidden) fetchLiveViewers();
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  const categoriesList = useMemo(() => {
    const baseList: Array<{ id: string; name: string; count: number }> = [
      { id: 'All', name: 'Toate', count: programs.length }
    ];

    if (favorites.length > 0) {
      baseList.push({ id: 'Favorites', name: '❤️ Favorite', count: favorites.length });
    }

    if (dbProgramCategories && dbProgramCategories.length > 0) {
      const matchesCategoryName = (p: TVProgram, catName: string) => {
        return p.category && p.category.toLowerCase() === catName.toLowerCase();
      };

      const activeCats = dbProgramCategories.filter(cat => 
        programs.some(p => matchesCategoryName(p, cat.name))
      );

      return [
        ...baseList,
        ...activeCats.map(cat => ({
          id: cat.name,
          name: cat.name,
          count: programs.filter(p => matchesCategoryName(p, cat.name)).length
        }))
      ];
    }

    const cats = new Set(programs.map(p => p.category).filter(Boolean));
    return [
      ...baseList,
      ...Array.from(cats).map(cat => ({
        id: cat,
        name: cat,
        count: programs.filter(p => p.category === cat).length
      }))
    ];
  }, [programs, dbProgramCategories, favorites]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const pCat = p.category || '';
      const matchesCategory = selectedCategory === 'All'
        ? true
        : selectedCategory === 'Favorites'
          ? favorites.includes(p.id)
          : pCat.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch = !channelSearchQuery ||
        p.title.toLowerCase().includes(channelSearchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(channelSearchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [programs, selectedCategory, channelSearchQuery, favorites]);

  const favoritePrograms = useMemo(() => 
    programs.filter(p => favorites.includes(p.id)), 
    [programs, favorites]
  );

  const recentShows = shows.slice(0, 6);

  const handleCopyLink = (channelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/ro/play/${channelId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopiedId(channelId);
        setTimeout(() => setCopiedId(null), 2500);
      }).catch(() => {});
    }
  };

  return (
    <div className={`transition-colors duration-200 min-h-screen ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>

      {/* Modern 2026 Impact Hero */}
      <section className={`relative border-b overflow-hidden pt-12 pb-16 transition-colors ${
        isDark 
          ? 'bg-zinc-950 border-zinc-850/80' 
          : 'bg-white border-slate-200/90'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            
            {/* Left Column: Heading & Quick Search */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-4 border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Portal Live TV & Ghid TV România 2026</span>
              </div>

              <h1 className={`text-4xl sm:text-5xl font-black tracking-tight leading-[1.12] mb-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {config?.heroTitle || 'Canale TV Live & Ghid de Programe'}
              </h1>

              <p className={`text-base leading-relaxed mb-6 font-medium max-w-xl ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                {config?.heroSubtitle || 'Urmărește gratuit posturile TV din România la calitate HD, consultă programul actualizat la minut și descoperă emisiunile care se difuzează chiar acum.'}
              </p>

              {/* Fast Channel Jump / Local Search */}
              <div className="relative max-w-lg mb-6">
                <Search className="w-5 h-5 text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={channelSearchQuery}
                  onChange={(e) => setChannelSearchQuery(e.target.value)}
                  placeholder="Caută rapid un canal (ex. Pro TV, Antena 1, Digi Sport)..."
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm font-semibold transition-all border outline-none ${
                    isDark 
                      ? 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 shadow-xs'
                  }`}
                />
                {channelSearchQuery && (
                  <button
                    onClick={() => setChannelSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-indigo-500 cursor-pointer"
                  >
                    Șterge
                  </button>
                )}
              </div>

              {/* Quick Jump Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
                  Acces Rapid:
                </span>
                <a
                  href="#acum-la-tv"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('acum-la-tv')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  ⚡ Acum la TV
                </a>
                <a
                  href="#urmeaza-la-tv"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('urmeaza-la-tv')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  ⏰ Urmează la TV
                </a>
                <Link
                  to="/ro/schedule"
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  📅 Programul de Azi
                </Link>
                <Link
                  to="/ro/favorite"
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-rose-400 hover:text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  ❤️ Favorite ({favorites.length})
                </Link>
                <button
                  onClick={() => setSelectedCategory('Sport')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  ⚽ Meciuri & Sport
                </button>
                <button
                  onClick={() => setSelectedCategory('Știri')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  📰 Știri 24/7
                </button>
              </div>
            </div>

            {/* Right Column: Platform Metrics & Featured Preview */}
            <div className="w-full lg:w-96 shrink-0">
              <div className={`p-6 rounded-3xl border shadow-sm ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Platformă Activă 2026
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">Live HD</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
                      {programs.length || '35+'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Canale TV
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-2xl font-black text-rose-500 block">
                      24/7
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Ghid TV Live
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-medium">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Redare stabilă pe mobil, tabletă & Smart TV</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Fără înregistrare sau abonamente plătite</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                    <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Program complet cu descrieri detaliate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* 0. Canale Vizitate Recent (Watch History Bar) */}
        {history.length > 0 && (
          <section className={`p-5 rounded-3xl border transition-colors shadow-xs ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-inherit">
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-indigo-500" />
                <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Văzute Recent
                </h3>
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">
                  ({history.length})
                </span>
              </div>
              <button
                onClick={clearHistory}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Șterge istoric
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {history.map((item) => (
                <Link
                  key={`hist-${item.channelId}`}
                  to={`/ro/play/${item.channelId}`}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border shrink-0 transition-all ${
                    isDark 
                      ? 'bg-zinc-950 border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900' 
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 p-1 flex items-center justify-center border border-inherit shrink-0">
                    {item.logo ? (
                      <img src={item.logo} alt={item.channelTitle} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Tv className="w-4 h-4 text-indigo-500" />
                    )}
                  </div>
                  <div className="min-w-0 pr-1">
                    <span className={`font-bold text-xs block truncate ${
                      isDark ? 'text-zinc-200 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'
                    }`}>
                      {item.channelTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {item.category || 'Live TV'}
                    </span>
                  </div>
                  <Play className="w-3 h-3 text-indigo-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 1. Dedicated "Acum la TV" (Now on TV) Section */}
        <NowOnTvSection 
          channels={programs} 
          customSchedule={scheduleItems} 
          isDark={isDark} 
        />

        {/* 1.5. Dedicated "Urmează la TV" (Upcoming TV Section) */}
        <UpcomingTvSection 
          channels={programs} 
          customSchedule={scheduleItems} 
          isDark={isDark} 
        />

        {/* 2. Favorite Channels (if any saved) */}
        {favoritePrograms.length > 0 && (
          <section className="scroll-mt-24">
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <Heart fill="currentColor" className="w-5 h-5 text-rose-500 animate-pulse" />
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Canalele Tale Favorite
                </h2>
              </div>
              <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {favoritePrograms.length} {favoritePrograms.length === 1 ? 'canal' : 'canale'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {favoritePrograms.map(p => {
                const viewers = liveViewers[p.id] || 0;
                return (
                  <div
                    key={`fav-${p.id}`}
                    className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden p-4 flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isDark 
                        ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                        : 'bg-white border-slate-200/90 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                          {p.logo ? (
                            <img src={p.logo} alt={p.title} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Tv className="w-6 h-6 text-indigo-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {p.title}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                            {p.category || 'Generalist'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="Șterge de la favorite"
                      >
                        <Heart fill="currentColor" className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-inherit">
                      <span className="text-rose-500 flex items-center gap-1.5 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {viewers > 1 ? `${viewers} telespectatori` : 'Transmisiune HD'}
                      </span>
                      <Link
                        to={`/play/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Urmărește</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Catalogul de Canale TV (Interactive Filter & Grid) */}
        <section id="canale" className="scroll-mt-24">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${
            isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <div>
              <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs mb-1">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Catalogul Complet de Canale</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Canale TV Live România
              </h2>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-xl border flex items-center gap-1 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                  }`}
                  title="Afișare Grilă"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                  }`}
                  title="Afișare Listă"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories Tab Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
            {categoriesList.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]'
                      : isDark
                        ? 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-850'
                        : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cat.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Channels Grid / List rendering */}
          {loadingSchedules ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-48 rounded-2xl border animate-pulse p-4 flex flex-col justify-between ${
                    isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                    <div className="space-y-2 flex-1">
                      <div className={`h-4 w-28 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                      <div className={`h-3 w-16 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                    </div>
                  </div>
                  <div className={`h-8 w-full rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                </div>
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl p-8 max-w-md mx-auto border ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <Tv className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                Niciun canal găsit
              </h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Nu am găsit niciun canal TV care să corespundă termenilor căutați.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setChannelSearchQuery('');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Resetează Căutarea
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredPrograms.map((p, idx) => {
                const realCount = liveViewers[p.id] || 0;
                const computedViewers = getCalculatedLiveViewers(p.id, p.title, p.category, p.rating, realCount);
                const formattedCount = formatViewerCount(computedViewers);
                const isFav = favorites.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className={`group relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isDark 
                        ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                        : 'bg-white border-slate-200/90 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Category, Share & Favorite */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {p.category || 'Generalist'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleCopyLink(p.id, e)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              copiedId === p.id
                                ? 'text-emerald-500 bg-emerald-500/10'
                                : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                            title={copiedId === p.id ? 'Link copiat!' : 'Distribuie canalul'}
                          >
                            {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              isFavorite(p.id) 
                                ? 'text-rose-500 bg-rose-500/10' 
                                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                            title={isFavorite(p.id) ? 'Șterge de la favorite' : 'Adaugă la favorite'}
                          >
                            <Heart fill={isFavorite(p.id) ? 'currentColor' : 'none'} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Logo and Info */}
                      <Link to={`/play/${p.id}`} className="block group/link mb-4">
                        <div className="w-full h-28 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-3 flex items-center justify-center mb-3 group-hover/link:border-indigo-500/40 transition-colors">
                          {p.logo ? (
                            <img 
                              src={p.logo} 
                              alt={p.title} 
                              width="120"
                              height="70"
                              decoding="async"
                              className="max-h-full max-w-full object-contain group-hover/link:scale-105 transition-transform duration-200" 
                              loading={idx < 4 ? "eager" : "lazy"}
                            />
                          ) : (
                            <Tv className="w-10 h-10 text-indigo-500" />
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-black text-base truncate group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {p.title}
                          </h3>
                          {p.rating && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{p.rating}</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-inherit flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {formattedCount} live
                      </span>

                      <Link
                        to={`/play/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Vezi Live</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredPrograms.map((p, idx) => {
                const realCount = liveViewers[p.id] || 0;
                const computedViewers = getCalculatedLiveViewers(p.id, p.title, p.category, p.rating, realCount);
                const formattedCount = formatViewerCount(computedViewers);
                const isFav = favorites.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-xs hover:shadow-md ${
                      isDark 
                        ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' 
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-2 flex items-center justify-center shrink-0">
                        {p.logo ? (
                          <img 
                            src={p.logo} 
                            alt={p.title} 
                            width="56" 
                            height="56" 
                            decoding="async"
                            loading={idx < 6 ? "eager" : "lazy"}
                            className="max-w-full max-h-full object-contain" 
                          />
                        ) : (
                          <Tv className="w-6 h-6 text-indigo-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-black text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {p.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {p.category || 'Generalist'}
                          </span>
                        </div>
                        <span className="text-xs text-rose-500 font-bold flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {formattedCount} telespectatori activi • Transmisiune HD
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleCopyLink(p.id, e)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          copiedId === p.id
                            ? 'text-emerald-500 bg-emerald-500/10'
                            : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                        title={copiedId === p.id ? 'Link copiat!' : 'Distribuie canalul'}
                      >
                        {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(p.id);
                        }}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isFavorite(p.id) ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                        title={isFavorite(p.id) ? 'Șterge de la favorite' : 'Adaugă la favorite'}
                      >
                        <Heart fill={isFavorite(p.id) ? 'currentColor' : 'none'} className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/ro/schedule?channel=${p.id}`}
                        className={`hidden sm:inline-flex px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                          isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Program TV
                      </Link>
                      <Link
                        to={`/ro/play/${p.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Deschide Live</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. Emisiuni pe Demand (VOD) Showcase */}
        {recentShows.length > 0 && (
          <section className="scroll-mt-24">
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <div>
                <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs mb-1">
                  <MonitorPlay className="w-4 h-4" />
                  <span>Selecție Video on Demand</span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Emisiuni pe Demand
                </h2>
              </div>

              <Link
                to="/shows"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Vezi Toate Emisiunile</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {recentShows.map(show => (
                <Link
                  key={show.id}
                  to={`/shows/${show.slug || show.id}`}
                  className={`group block rounded-2xl overflow-hidden border transition-all duration-200 shadow-xs hover:shadow-md ${
                    isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-slate-200 dark:bg-zinc-900">
                    {show.thumbnail ? (
                      <img
                        src={show.thumbnail}
                        alt={show.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400">
                        {show.title[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className={`font-bold text-xs line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                      isDark ? 'text-zinc-200' : 'text-slate-800'
                    }`}>
                      {show.title}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 block mt-0.5 truncate">
                      {show.category || 'Divertisment'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
