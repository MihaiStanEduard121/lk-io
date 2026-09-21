import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useOutletContext, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { TVProgram, TVScheduleItem } from '../../types';
import Markdown from 'react-markdown';
import TvLivePlayer from '../../components/TvLivePlayer';
import { 
  Share2, 
  Star, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Heart, 
  Check, 
  Sparkles, 
  Tv, 
  ChevronRight,
  Radio,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { getCalculatedLiveViewers, formatViewerCount } from '../../lib/viewerUtils';
import { getChannelLiveSchedule, ChannelLiveInfo } from '../../lib/tvScheduleUtils';
import { normalizeChannelId, createDynamicChannelFallback } from '../../lib/channelsData';

export function enhanceEmbedCode(embedCode: string | undefined): string {
  if (!embedCode) return '';
  let clean = embedCode.trim();

  // If broken canale-tv iframe, do not render to avoid 403 / Cloudflare error
  if (clean.includes('canale-tv.net')) {
    return '';
  }

  // If raw URL, convert to appropriate player embed
  const isUrl = /^https?:\/\/[^\s<>\"]+$/i.test(clean);
  if (isUrl) {
    const url = clean;
    if (url.includes('.m3u8')) {
      return `<video class="plyr-video w-full h-full" controls autoplay muted playsinline><source src="${url}" type="application/x-mpegURL">Your browser does not support video playback.</video>`;
    } else if (url.includes('youtube.com/watch?v=') || url.includes('youtube.com/v/')) {
      const match = url.match(/(?:v=|v\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        clean = `<iframe src="https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1" frameborder="0"></iframe>`;
      }
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        clean = `<iframe src="https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1" frameborder="0"></iframe>`;
      }
    } else if (url.includes('vimeo.com/')) {
      const match = url.match(/vimeo\.com\/([0-9]+)/);
      if (match) {
        clean = `<iframe src="https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1" frameborder="0"></iframe>`;
      }
    } else if (url.includes('dailymotion.com/video/')) {
      const match = url.match(/video\/([a-zA-Z0-9]+)/);
      if (match) {
        clean = `<iframe src="https://www.dailymotion.com/embed/video/${match[1]}?autoplay=1&mute=1" frameborder="0"></iframe>`;
      }
    } else if (url.endsWith('.mp4') || url.endsWith('.mkv') || url.endsWith('.webm') || url.endsWith('.ogg')) {
      clean = `<video class="plyr-video w-full h-full" controls autoplay muted playsinline><source src="${url}">Your browser does not support video playback.</video>`;
    } else {
      clean = `<iframe src="${url}" frameborder="0"></iframe>`;
    }
  }

  // Optimize iframe tags for secure, responsive, full-screen playback
  if (clean.includes('<iframe')) {
    clean = clean.replace(/src="http:\/\//gi, 'src="https://');
    clean = clean.replace(/src='http:\/\//gi, "src='https://");
    clean = clean.replace(/width="[^"]*"/gi, 'width="100%"');
    clean = clean.replace(/width='[^']*'/gi, "width='100%'");
    clean = clean.replace(/height="[^"]*"/gi, 'height="100%"');
    clean = clean.replace(/height='[^']*'/gi, "height='100%'");

    clean = clean.replace(/style="[^"]*(width|height):\s*[0-9]+px[^"]*"/gi, (match) => {
      let res = match.replace(/(width):\s*[0-9]+px/gi, 'width: 100%');
      res = res.replace(/(height):\s*[0-9]+px/gi, 'height: 100%');
      return res;
    });

    if (clean.includes('referrerpolicy=')) {
      clean = clean.replace(/referrerpolicy="[^"]*"/gi, 'referrerpolicy="strict-origin-when-cross-origin"');
      clean = clean.replace(/referrerpolicy='[^']*'/gi, 'referrerpolicy="strict-origin-when-cross-origin"');
    } else {
      clean = clean.replace(/<iframe/gi, '<iframe referrerpolicy="strict-origin-when-cross-origin"');
    }

    const correctAllow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    if (clean.includes('allow=')) {
      clean = clean.replace(/allow="[^"]*"/gi, `allow="${correctAllow}"`);
      clean = clean.replace(/allow='[^']*'/gi, `allow="${correctAllow}"`);
    } else {
      clean = clean.replace(/<iframe/gi, `<iframe allow="${correctAllow}"`);
    }

    if (!clean.toLowerCase().includes('allowfullscreen')) {
      clean = clean.replace(/<iframe/gi, '<iframe allowfullscreen="true"');
    }

    if (clean.includes('sandbox=')) {
      clean = clean.replace(/sandbox="[^"]*"/gi, '');
      clean = clean.replace(/sandbox='[^']*'/gi, '');
    }

    if (clean.includes('player.twitch.tv')) {
      try {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const srcMatch = clean.match(/src="([^"]+)"/i) || clean.match(/src='([^']+)'/i);
        if (srcMatch) {
          const originalSrc = srcMatch[1];
          let updatedSrc = originalSrc;
          if (!originalSrc.includes('parent=')) {
            const separator = originalSrc.includes('?') ? '&' : '?';
            updatedSrc = `${originalSrc}${separator}parent=${hostname}`;
          } else {
            updatedSrc = originalSrc.replace(/parent=[a-zA-Z0-9\.\-_]+/gi, `parent=${hostname}`);
          }
          clean = clean.replace(originalSrc, updatedSrc);
        }
      } catch (e) {
        console.warn('Twitch parent URL parsing error:', e);
      }
    }
  }
  return clean;
}

export default function PlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext<{ theme?: string; isDark?: boolean }>() || {};
  const isDark = context.isDark ?? (context.theme === 'dark');

  const [program, setProgram] = useState<TVProgram | null>(null);
  const [recommendations, setRecommendations] = useState<TVProgram[]>([]);
  const [schedule, setSchedule] = useState<TVScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liveViewers, setLiveViewers] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const canonicalId = useMemo(() => normalizeChannelId(id || 'pro-tv'), [id]);

  // If user hits literally ':id' or 'id' or empty in URL, redirect to canonical /ro/play/pro-tv
  useEffect(() => {
    if (!id || id === ':id' || id === 'id') {
      navigate('/ro/play/pro-tv', { replace: true });
    }
  }, [id, navigate]);

  // Load channel, recommendations, schedule
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);

    const targetId = canonicalId || 'pro-tv';
    const safeFetchChannel = api.getProgram(targetId).catch(() => createDynamicChannelFallback(targetId));
    const safeFetchAll = api.getPrograms().catch(() => []);
    const safeFetchEpg = api.getChannelEPG(targetId).catch(() => []);
    const safeFetchFallbackSched = api.getSchedule().catch(() => []);

    Promise.all([
      safeFetchChannel,
      safeFetchAll,
      safeFetchEpg,
      safeFetchFallbackSched
    ]).then(([channelData, allPrograms, epgSched, fallbackSched]) => {
      const finalChannel = channelData || createDynamicChannelFallback(targetId);
      setProgram(finalChannel);

      if (Array.isArray(epgSched) && epgSched.length > 0) {
        const mapped = epgSched.map(item => ({
          id: item.id,
          time: item.time || item.startFormatted,
          endTime: item.endTime || item.endFormatted,
          title: item.title,
          description: item.description,
          channelId: item.channelId || targetId,
          category: item.category,
          date: item.date,
          image: item.image
        }));
        setSchedule(mapped);
      } else {
        setSchedule(fallbackSched || []);
      }

      const filtered = (allPrograms || [])
        .filter((p: any) => p.id !== targetId && p.id !== id && p.status === 'online')
        .sort((a: any, b: any) => {
          if (a.category === finalChannel.category && b.category !== finalChannel.category) return -1;
          if (a.category !== finalChannel.category && b.category === finalChannel.category) return 1;
          return (b.views || 0) - (a.views || 0);
        })
        .slice(0, 6);
      setRecommendations(filtered);
      setLoading(false);
    }).catch(err => {
      console.warn('Error loading channel player:', err);
      // Even if an unexpected error occurs, generate fallback channel
      const fallback = createDynamicChannelFallback(targetId);
      setProgram(fallback);
      setLoading(false);
    });

    try {
      const saved = localStorage.getItem('savedFavorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      console.warn('Error loading favorites:', e);
    }
  }, [id, canonicalId]);

  // Live presence polling
  useEffect(() => {
    const fetchLiveCount = async () => {
      try {
        const res = await fetch('/api/presence/stats');
        if (res.ok) {
          const stats = await res.json();
          const count = stats.pageStats?.[`/play/${id}`] || stats.pageStats?.[`/play/${canonicalId}`] || 1;
          setLiveViewers(count);
        }
      } catch (err) {
        console.warn('Could not fetch active viewers', err);
      }
    };

    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 8000);
    return () => clearInterval(interval);
  }, [id, canonicalId]);

  // Live channel broadcast info
  const liveInfo: ChannelLiveInfo = useMemo(() => {
    const targetId = canonicalId || id || 'pro-tv';
    return getChannelLiveSchedule(targetId, schedule);
  }, [canonicalId, id, schedule]);

  // Channel's schedule for today
  const todayIso = new Date().toISOString().split('T')[0];
  const channelScheduleToday = useMemo(() => {
    const targetId = (canonicalId || id || '').toLowerCase();
    const rawTarget = (id || '').toLowerCase();
    return schedule.filter(s => {
      const sCh = (s.channelId || '').toLowerCase();
      return (sCh === targetId || sCh === rawTarget) && s.date === todayIso;
    });
  }, [canonicalId, id, schedule, todayIso]);

  const isFavorite = id ? favorites.includes(id) : false;
  const toggleFavorite = () => {
    if (!id) return;
    let next: string[];
    if (isFavorite) {
      next = favorites.filter(f => f !== id);
    } else {
      next = [...favorites, id];
    }
    setFavorites(next);
    localStorage.setItem('savedFavorites', JSON.stringify(next));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center font-bold ${
        isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-slate-50 text-slate-500'
      }`}>
        <div className="flex h-4 w-4 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600"></span>
        </div>
        <span className="text-sm font-semibold">Se inițializează transmisia live...</span>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className={`min-h-[70vh] flex items-center justify-center flex-col p-6 text-center ${
        isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-slate-50 text-slate-800'
      }`}>
        <ArrowLeft className="w-10 h-10 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black mb-2">Canalul TV nu este disponibil</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Canalul solicitat nu există sau fluxul este momentan în mentenanță.
        </p>
        <Link 
          to="/" 
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
        >
          Înapoi la Canale TV
        </Link>
      </div>
    );
  }

  const computedViewers = getCalculatedLiveViewers(
    program.id, 
    program.title, 
    program.category, 
    program.rating, 
    liveViewers
  );
  const formattedCount = formatViewerCount(computedViewers);

  return (
    <div className={`transition-colors duration-200 min-h-screen py-8 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link to="/ro" className="text-slate-400 dark:text-zinc-500 hover:text-indigo-600">
              Acasă
            </Link>
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <Link to="/ro#canale" className="text-slate-400 dark:text-zinc-500 hover:text-indigo-600">
              Canale TV
            </Link>
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <span className={`font-bold truncate max-w-[200px] sm:max-w-none ${
              isDark ? 'text-zinc-200' : 'text-slate-800'
            }`}>
              {program.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>LIVE</span>
            </span>

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isFavorite 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                  : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
              }`}
              title={isFavorite ? 'Elimină de la favorite' : 'Salvează la favorite'}
            >
              <Heart fill={isFavorite ? 'currentColor' : 'none'} className="w-4 h-4" />
              <span className="hidden sm:inline">{isFavorite ? 'Favorit' : 'Adaugă la Favorite'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCopied 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                  : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-indigo-500" />}
              <span className="hidden sm:inline">{isCopied ? 'Link Copiat!' : 'Distribuie'}</span>
            </button>
          </div>
        </div>

        {/* Cinema Video Player Container */}
        <TvLivePlayer
          streamUrl={program.streamUrl}
          backupStreamUrl={program.backupStreamUrl}
          embedCode={program.embedCode}
          title={program.title}
          thumbnail={program.thumbnail}
          isDark={isDark}
        />

        {/* Live Broadcast Progress Bar Strip */}
        <div className={`mt-4 p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Current Show Details */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    ACUM LA {program.title.toUpperCase()}
                  </span>
                  {liveInfo.currentProgram && (
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-500">
                      ({liveInfo.currentProgram.startTime} - {liveInfo.currentProgram.endTime})
                    </span>
                  )}
                </div>

                <h2 className={`font-black text-sm sm:text-base truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {liveInfo.currentProgram?.title || 'Transmisiune în Direct HD'}
                </h2>
              </div>
            </div>

            {/* Progress & Next Show */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
              {liveInfo.currentProgram && (
                <div className="w-48 space-y-1">
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${liveInfo.currentProgram.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                    <span>{liveInfo.currentProgram.progressPercent}%</span>
                    <span>încă ~{liveInfo.currentProgram.remainingMinutes} min</span>
                  </div>
                </div>
              )}

              {/* Link to Full Schedule */}
              <Link
                to={`/schedule?channel=${program.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Ghid TV Complet</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Details & Sidebar Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Channel Metrics & Metadata */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-[11px]">
                  {program.category || 'Generalist'}
                </span>
                {program.quality && (
                  <span className={`px-2.5 py-1 rounded-xl border font-bold text-[11px] ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {program.quality} HD
                  </span>
                )}
                {program.rating && (
                  <span className="flex items-center gap-1 font-bold text-amber-500 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{program.rating}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-rose-500 font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px]">
                  <Users className="w-3.5 h-3.5" />
                  <span>{formattedCount} telespectatori activi</span>
                </span>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-black mb-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Despre {program.title}
              </h1>

              {program.description ? (
                <div className={`prose max-w-none text-sm leading-relaxed ${
                  isDark ? 'prose-invert text-zinc-300' : 'text-slate-600'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{program.description}</Markdown>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Urmărește postul {program.title} în direct pe programetv.online gratuit, fără întreruperi.
                </p>
              )}

              {/* Tags */}
              {program.tags && program.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-inherit flex flex-wrap gap-2">
                  {program.tags.map(tag => (
                    <span 
                      key={tag} 
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Schedule for this channel */}
            {channelScheduleToday.length > 0 && (
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Programul TV de Azi ({program.title})
                    </h3>
                  </div>
                  <Link
                    to={`/schedule?channel=${program.id}`}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Vezi toate zilele</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {channelScheduleToday.slice(0, 8).map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                        isDark ? 'bg-zinc-950/60 border-zinc-800/70' : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-12 shrink-0">
                          {item.time}
                        </span>
                        <span className={`font-bold truncate ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                      </div>
                      {item.description && (
                        <span className="hidden md:inline text-[11px] text-slate-400 dark:text-zinc-500 truncate max-w-xs">
                          {item.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar: Recommended Channels (Right 1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-5 rounded-3xl border ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-inherit">
                <h3 className={`text-xs font-black uppercase tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  Alte Canale TV
                </h3>
                <Link to="/ro#canale" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Toate
                </Link>
              </div>

              <div className="space-y-3">
                {recommendations.map(rec => (
                  <Link
                    key={rec.id}
                    to={`/ro/play/${rec.id}`}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 group ${
                      isDark 
                        ? 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700' 
                        : 'bg-slate-50 border-slate-200/80 hover:border-indigo-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 flex items-center justify-center shrink-0">
                      {rec.logo ? (
                        <img src={rec.logo} alt={rec.title} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Radio className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-black truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                        isDark ? 'text-zinc-200' : 'text-slate-800'
                      }`}>
                        {rec.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                          {rec.category || 'Generalist'}
                        </span>
                        <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                          Live HD
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
