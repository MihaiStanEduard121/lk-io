import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Tv, Film, Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Channel, Show, Article } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export default function SearchModal({ isOpen, onClose, isDark }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        api.getPrograms(),
        api.getShows(),
        api.getArticles()
      ]).then(([ch, sh, art]) => {
        setChannels(ch || []);
        setShows(sh || []);
        setArticles(art || []);
        setLoading(false);
      }).catch(() => setLoading(false));

      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const filteredChannels = q ? channels.filter(c => 
    c.title.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q))
  ).slice(0, 4) : channels.slice(0, 4);

  const filteredShows = q ? shows.filter(s => 
    s.title.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))
  ).slice(0, 3) : [];

  const filteredArticles = q ? articles.filter(a => 
    a.title.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div 
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 ${
          isDark 
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/80' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleFullSearch} className="flex items-center px-4 py-3.5 border-b border-inherit gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută canale TV, meciuri, emisiuni, știri..."
            className="w-full bg-transparent text-base font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            ESC
          </kbd>
        </form>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 dark:text-zinc-500 gap-2 font-medium text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Se caută în catalog...</span>
            </div>
          ) : (
            <>
              {/* Channels */}
              {filteredChannels.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5" /> Canale TV Live
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-bold">{filteredChannels.length} canale</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredChannels.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => handleSelect(`/play/${ch.id}`)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                          isDark 
                            ? 'bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700' 
                            : 'bg-slate-50 border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {ch.logo ? (
                            <img src={ch.logo} alt={ch.title} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Tv className="w-5 h-5 text-indigo-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm truncate group-hover:text-indigo-500 transition-colors">
                              {ch.title}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                            {ch.category || 'Generalist'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shows */}
              {filteredShows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Emisiuni (VOD)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredShows.map(sh => (
                      <button
                        key={sh.id}
                        onClick={() => handleSelect(`/shows/${sh.slug || sh.id}`)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                          isDark 
                            ? 'bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-800/60' 
                            : 'bg-slate-50 border-slate-200/80 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm truncate group-hover:text-indigo-500 transition-colors">
                            {sh.title}
                          </div>
                          {sh.description && (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {sh.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles */}
              {filteredArticles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5" /> Știri & Articole
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredArticles.map(art => (
                      <button
                        key={art.id}
                        onClick={() => handleSelect(`/news/${art.slug || art.id}`)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                          isDark 
                            ? 'bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-800/60' 
                            : 'bg-slate-50 border-slate-200/80 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="font-bold text-sm truncate group-hover:text-indigo-500 transition-colors">
                          {art.title}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q && filteredChannels.length === 0 && filteredShows.length === 0 && filteredArticles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">
                    Niciun rezultat pentru "{query}"
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                    Apasă Enter pentru a căuta detaliat pe pagina dedicată.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 px-4 border-t border-inherit flex items-center justify-between text-xs font-semibold ${
          isDark ? 'bg-zinc-950/60 text-zinc-400' : 'bg-slate-50 text-slate-500'
        }`}>
          <span>Apasă <strong className="text-indigo-500 font-bold">Enter</strong> pentru căutare avansată</span>
          {query.trim() && (
            <button
              onClick={handleFullSearch}
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Vezi toate rezultatele <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
