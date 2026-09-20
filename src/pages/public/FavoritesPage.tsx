import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Heart, Play, Calendar, Trash2, ArrowRight, Tv, Radio, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { TVProgram } from '../../types';
import { useFavorites } from '../../lib/useFavorites';
import { getChannelLiveSchedule } from '../../lib/tvScheduleUtils';

export default function FavoritesPage() {
  const context = useOutletContext<{ isDark?: boolean; theme?: string }>() || {};
  const isDark = context.isDark ?? (context.theme === 'dark');

  const { favorites, removeFavorite } = useFavorites();
  const [allPrograms, setAllPrograms] = useState<TVProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getPrograms().then(progs => {
      setAllPrograms(progs || []);
      setLoading(false);
    }).catch(err => {
      console.warn('Error loading programs in favorites:', err);
      setLoading(false);
    });
  }, []);

  const favoriteChannels = allPrograms.filter(p => favorites.includes(p.id));
  const suggestedChannels = allPrograms.filter(p => !favorites.includes(p.id)).slice(0, 4);

  return (
    <div className={`min-h-screen py-10 transition-colors duration-200 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs mb-1">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Canalele Tale Preferate</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Canale Favorite ({favoriteChannels.length})
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Accesează instant transmisiunile și programul TV pentru posturile salvate.
            </p>
          </div>

          {favorites.length > 0 && (
            <Link
              to="/ro/schedule"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Vezi Ghidul Complet</span>
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-400">Se încarcă lista de favorite...</p>
          </div>
        ) : favoriteChannels.length > 0 ? (
          /* Grid of Favorites */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteChannels.map(channel => {
              const live = getChannelLiveSchedule(channel.id);
              const cur = live.currentProgram;

              return (
                <div
                  key={channel.id}
                  className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isDark 
                      ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700' 
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Logo & Remove Button */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-2 flex items-center justify-center shrink-0 shadow-xs">
                          {(channel.logo || channel.thumbnail) ? (
                            <img src={channel.logo || channel.thumbnail} alt={channel.title} className="w-full h-full object-contain" />
                          ) : (
                            <Tv className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                            {channel.title}
                          </h3>
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                            {channel.category || 'Generalist'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFavorite(channel.id)}
                        title="Elimină din favorite"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Live Broadcast Info */}
                    {cur && (
                      <div className={`p-3 rounded-2xl border mb-5 ${
                        isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>Acum la TV</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">
                          {cur.title}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
                          <span>{cur.startTime} - {cur.endTime}</span>
                          <span>rămase {cur.remainingMinutes} min</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <Link
                      to={`/ro/play/${channel.id}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Urmărește Live</span>
                    </Link>

                    <Link
                      to={`/ro/schedule?channel=${channel.id}`}
                      title="Vezi programul complet"
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                        isDark 
                          ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className={`p-12 rounded-3xl border text-center max-w-2xl mx-auto my-8 ${
            isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Nu ai adăugat încă niciun canal favorit
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              Apasă pe pictograma inimioară de pe cardul oricărui post TV pentru a-l salva aici și a-l accesa dintr-un singur click.
            </p>

            <Link
              to="/ro"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Explorează Canalele Live</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {suggestedChannels.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800 text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">
                  Canale Recomandate:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {suggestedChannels.map(ch => (
                    <Link
                      key={ch.id}
                      to={`/ro/play/${ch.id}`}
                      className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                        isDark ? 'bg-zinc-950/70 border-zinc-800 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center mb-2">
                        {ch.logo || ch.thumbnail ? (
                          <img src={ch.logo || ch.thumbnail} alt={ch.title} className="w-full h-full object-contain" />
                        ) : (
                          <Tv className="w-4 h-4 text-indigo-500" />
                        )}
                      </div>
                      <span className="text-xs font-bold truncate w-full text-slate-800 dark:text-zinc-200">
                        {ch.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
