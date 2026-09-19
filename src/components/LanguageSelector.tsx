import { useState, useRef, useEffect } from 'react';
import { useAppLanguage, SUPPORTED_LANGUAGES, Language } from '../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSelector() {
  const { currentLang, setLanguage } = useAppLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold select-none cursor-pointer bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 text-slate-700 dark:text-zinc-200 shadow-xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <img
          src={`https://flagcdn.com/w40/${activeLanguage.flag}.png`}
          alt={activeLanguage.label}
          className="w-4 h-auto object-contain rounded-xs shadow-xs"
          referrerPolicy="no-referrer"
        />
        <span className="hidden md:inline font-bold text-[11px]">{activeLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl z-[100] py-1.5 overflow-hidden animate-in fade-in duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-zinc-800/80 flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-400">Alege Limba</span>
          </div>
          <div className="max-h-[260px] overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang: Language) => {
              const active = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center space-x-2.5 transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.flag}.png`}
                    alt={lang.label}
                    className="w-4 h-auto object-contain rounded-xs shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <span className="flex-1 truncate font-medium">{lang.label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
