import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Tv, 
  CalendarDays, 
  Film, 
  Newspaper, 
  Trophy, 
  Search, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  Radio,
  Heart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector';
import GlobalPopup from '../GlobalPopup';
import DonateButton from '../DonateButton';
import SearchModal from '../SearchModal';
import { useFavorites } from '../../lib/useFavorites';
import { useReminders } from '../../lib/useReminders';
import ReminderNotificationModal from '../ReminderNotificationModal';
import BackToTopButton from '../BackToTopButton';
import PwaInstallButton from '../PwaInstallButton';

export default function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const location = useLocation();
  const { currentLang, translateUI } = useAppLanguage();
  const { favorites } = useFavorites();
  const { activeAlert, clearAlert } = useReminders();

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Global Ctrl+K / Cmd+K listener for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const langPrefix = currentLang ? `/${currentLang}` : '/ro';

  const navLinks = [
    { to: langPrefix, label: translateUI('nav.home') || 'Acasă', icon: Tv, exact: true },
    { to: `${langPrefix}/schedule`, label: translateUI('nav.schedule') || 'Ghid TV', icon: CalendarDays },
    { to: `${langPrefix}/shows`, label: translateUI('nav.shows') || 'Emisiuni', icon: Film },
    { to: `${langPrefix}/news`, label: translateUI('nav.news') || 'Știri TV', icon: Newspaper },
    { 
      to: `${langPrefix}/favorite`, 
      label: 'Favorite', 
      icon: Heart, 
      badge: favorites.length > 0 ? String(favorites.length) : undefined,
      badgeColor: 'rose'
    },
    { to: `${langPrefix}/world-cup`, label: translateUI('nav.worldcup') || 'Cupa Mondială', icon: Trophy, badge: '2026' }
  ];

  const isActive = (to: string, exact = false) => {
    const current = location.pathname.replace(/\/+$/, '') || '/';
    const target = to.replace(/\/+$/, '') || '/';
    if (exact) return current === target || current === `${target}/ro` || (target === '/ro' && current === '/');
    return current.startsWith(target);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30' : 'bg-slate-50 text-slate-900 selection:bg-indigo-500/20'
    }`}>
      <GlobalPopup />
      <DonateButton />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} isDark={isDark} />
      <ReminderNotificationModal alert={activeAlert} onClose={clearAlert} isDark={isDark} />
      <BackToTopButton />

      {/* Modern 2026 Navigation Header */}
      <header 
        className={`sticky top-0 w-full z-40 transition-all duration-200 backdrop-blur-xl border-b ${
          isDark 
            ? 'bg-zinc-950/80 border-zinc-800/80 shadow-xs' 
            : 'bg-white/85 border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link to={langPrefix} className="flex items-center gap-2.5 group" id="main-brand-logo">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  <Tv className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="font-black text-lg tracking-tight">programetv</span>
                    <span className="font-extrabold text-lg text-indigo-600 dark:text-indigo-400">.online</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 -mt-1 tracking-wider uppercase hidden sm:block">
                    Ghid TV & Live HD
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1.5 ml-4">
                {navLinks.map(link => {
                  const Icon = link.icon;
                  const active = isActive(link.to, link.exact);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? isDark 
                            ? 'bg-zinc-900 text-white shadow-xs border border-zinc-800' 
                            : 'bg-slate-100 text-indigo-600 shadow-xs border border-slate-200'
                          : isDark
                            ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? (link.badgeColor === 'rose' ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400') : 'opacity-70'}`} />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          link.badgeColor === 'rose'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Actions & Utilities */}
            <div className="flex items-center gap-2">
              {/* PWA Install Button */}
              <PwaInstallButton className="hidden md:inline-flex" />

              {/* Instant Search Bar Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-xs'
                }`}
                title="Caută (Ctrl+K)"
                id="header-search-btn"
              >
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Caută...</span>
                <kbd className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 text-amber-400 hover:bg-zinc-850 hover:border-zinc-700'
                    : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 shadow-xs'
                }`}
                aria-label="Schimbă tema"
                title={isDark ? 'Activează tema luminoasă' : 'Activează tema întunecată'}
                id="header-theme-toggle"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Language Selector */}
              <LanguageSelector />

              {/* User Profile */}
              <Link
                to="/profile"
                className={`p-2 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
                aria-label="Profil utilizator"
                title="Profil"
                id="header-profile-link"
              >
                <User className="w-4 h-4" />
              </Link>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
                aria-label="Meniu mobil"
                id="header-mobile-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-b px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <div className="grid grid-cols-1 gap-1.5">
              {navLinks.map(link => {
                const Icon = link.icon;
                const active = isActive(link.to, link.exact);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      active
                        ? isDark 
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' 
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : isDark
                          ? 'text-zinc-300 hover:bg-zinc-900'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${link.badgeColor === 'rose' ? 'text-rose-500' : 'text-indigo-500'}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge ? (
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        link.badgeColor === 'rose' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {link.badge}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <PwaInstallButton className="w-full justify-center py-2.5" />
            </div>

            {/* Mobile Quick Channels Jump */}
            <div className="pt-3 border-t border-inherit">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                  Canale Recomandate
                </span>
                <Link to={langPrefix} onClick={() => setMobileMenuOpen(false)} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  Toate canalele
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Pro TV', id: 'pro-tv' },
                  { name: 'Antena 1', id: 'antena-1' },
                  { name: 'Digi Sport 1', id: 'digi-sport-1' },
                  { name: 'Kanal D', id: 'kanal-d' },
                  { name: 'Digi24', id: 'digi24' },
                  { name: 'HBO', id: 'hbo' }
                ].map(c => (
                  <Link
                    key={c.id}
                    to={`${langPrefix}/play/${c.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-center py-2 px-1.5 rounded-lg border text-xs font-bold truncate transition-all ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-indigo-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-500/50'
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-grow">
        <Outlet context={{ theme, isDark }} />
      </main>

      {/* Modern 2026 Structured Footer */}
      <footer 
        className={`border-t transition-colors duration-200 pt-16 pb-12 ${
          isDark 
            ? 'bg-zinc-950 border-zinc-900 text-zinc-400' 
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-inherit">
            
            {/* Col 1: Brand & Identity */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white">
                  <Tv className="w-4 h-4" />
                </div>
                <span className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  programetv<span className="text-indigo-600 dark:text-indigo-400">.online</span>
                </span>
              </Link>
              <p className="text-xs leading-relaxed max-w-md opacity-85">
                {translateUI('footer.description')}
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Ghid TV actualizat la minut • Serviciu activ 2026</span>
              </div>
            </div>

            {/* Col 2: Navigare Rapidă */}
            <div className="space-y-3">
              <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Navigare
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Canale Live TV
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Program TV (Ghid Complet)
                  </Link>
                </li>
                <li>
                  <Link to="/shows" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Emisiuni pe Demand (VOD)
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Știri & Articole Media
                  </Link>
                </li>
                <li>
                  <Link to="/world-cup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Cupa Mondială 2026
                  </Link>
                </li>
                <li>
                  <Link to="/donations" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Susține Proiectul
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Categorii Canale */}
            <div className="space-y-3">
              <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Categorii Canale
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <Link to="/?category=generalist" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Canale Generaliste
                  </Link>
                </li>
                <li>
                  <Link to="/?category=sport" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Canale de Sport (Fotbal, Tenis)
                  </Link>
                </li>
                <li>
                  <Link to="/?category=stiri" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Canale de Știri 24/7
                  </Link>
                </li>
                <li>
                  <Link to="/?category=filme" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Filme & Seriale Premium
                  </Link>
                </li>
                <li>
                  <Link to="/?category=documentare" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Documentare & Știință
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & GDPR */}
            <div className="space-y-3">
              <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Legal & Conformitate
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link to="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Politica de Confidențialitate
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Termeni și Condiții
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Politica privind Cookie-urile
                  </Link>
                </li>
                <li>
                  <Link to="/dmca" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Notificare DMCA
                  </Link>
                </li>
                <li>
                  <Link to="/copyright" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Drepturi de Autor & Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/delete-my-data" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Ștergerea Datelor (GDPR)
                  </Link>
                </li>
                <li>
                  <Link to="/legal-contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Contact Juridic
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Sub-bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium opacity-80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>
                © {new Date().getFullYear()} programetv.online • Toate drepturile rezervate.
              </span>
            </div>
            <p className="text-center sm:text-right text-[11px] max-w-lg">
              Toate logo-urile și mărcile aparțin deținătorilor legali respectivi. Redarea se face prin elemente de încorporare iframe publice externe.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
