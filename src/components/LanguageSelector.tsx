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
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200 transition-all text-xs font-semibold select-none cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <img
          src={`https://flagcdn.com/w40/${activeLanguage.flag}.png`}
          alt={activeLanguage.label}
          className="w-4 h-auto object-contain rounded-sm"
          referrerPolicy="no-referrer"
        />
        <span className="hidden leading-none sm:inline">{activeLanguage.label}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] py-1.5 overflow-hidden animate-in fade-in duration-100">
          <div className="px-3 py-1.5 border-b border-zinc-850/60 flex items-center space-x-1.5">
            <Globe className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Alege Limba / Language</span>
          </div>
          <div className="max-h-[240px] overflow-y-auto scrollbar-none py-1">
            {SUPPORTED_LANGUAGES.map((lang: Language) => {
              const active = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600/10 text-white font-bold'
                      : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.flag}.png`}
                    alt={lang.label}
                    className="w-4.5 h-3 object-contain rounded-xs shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <span className="flex-1 truncate">{lang.label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
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
