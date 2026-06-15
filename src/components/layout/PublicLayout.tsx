import { Outlet, Link, useLocation } from 'react-router-dom';
import { Tv, Search, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector';
import GlobalPopup from '../GlobalPopup';

export default function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const location = useLocation();
  const { translateUI } = useAppLanguage();

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);
  
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50 border-border' : 'bg-slate-50 text-zinc-900'}`}>
      <GlobalPopup />
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b ${theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3">
                <img src="/src/assets/images/modern_tv_logo_1781111684612.png" alt="programetv.online Logo" className="h-8 w-auto rounded opacity-90 hover:opacity-100 transition-opacity drop-shadow-md" />
                <span className={`font-bold text-xl tracking-tight hidden sm:block bg-gradient-to-br bg-clip-text text-transparent ${theme === 'dark' ? 'from-white to-zinc-400' : 'from-indigo-900 to-indigo-600'}`}>programetv.online</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link to="/" className={`${location.pathname === '/' ? (theme === 'dark' ? 'text-white font-bold' : 'text-indigo-600 font-extrabold') : (theme === 'dark' ? 'text-zinc-400 hover:text-white transition-colors' : 'text-zinc-500 hover:text-indigo-600 transition-colors')}`}>{translateUI('nav.home')}</Link>
                <Link to="/schedule" className={`${location.pathname.startsWith('/schedule') ? (theme === 'dark' ? 'text-white' : 'text-indigo-650 font-bold') : (theme === 'dark' ? 'text-zinc-400 hover:text-white transition-colors' : 'text-zinc-500 hover:text-indigo-650 transition-colors')}`}>{translateUI('nav.schedule')}</Link>
                <Link to="/shows" className={`${location.pathname.startsWith('/shows') ? (theme === 'dark' ? 'text-white' : 'text-indigo-650 font-bold') : (theme === 'dark' ? 'text-zinc-400 hover:text-white transition-colors' : 'text-zinc-500 hover:text-indigo-650 transition-colors')}`}>{translateUI('nav.shows')}</Link>
                <Link to="/news" className={`${location.pathname.startsWith('/news') ? (theme === 'dark' ? 'text-white' : 'text-indigo-650 font-bold') : (theme === 'dark' ? 'text-zinc-400 hover:text-white transition-colors' : 'text-zinc-500 hover:text-indigo-650 transition-colors')}`}>{translateUI('nav.news')}</Link>
                <Link to="/world-cup" className={`${location.pathname.startsWith('/world-cup') ? 'text-amber-500 font-bold flex items-center' : 'text-zinc-400 hover:text-amber-500 transition-colors flex items-center'}`}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1.5" />
                  {translateUI('nav.worldcup')}
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Theme Toggle Switch */}
              <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors cursor-pointer select-none ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-zinc-650 hover:text-zinc-900 hover:bg-slate-100'}`} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-450" /> : <Moon className="h-5 w-5 text-indigo-750" />}
              </button>
              
              <Link to="/profile" className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-zinc-650 hover:text-zinc-900 hover:bg-slate-100'}`}>
                <User className="h-5 w-5" />
              </Link>
              <LanguageSelector />
              <button onClick={() => setSearchOpen(!searchOpen)} className={`p-2 rounded-lg transition-colors select-none cursor-pointer ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-zinc-650 hover:text-zinc-900 hover:bg-slate-100'}`}>
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {searchOpen && (
        <div className={`fixed top-16 w-full z-40 border-b p-4 shadow-xl transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="max-w-3xl mx-auto">
            <input 
              autoFocus
              type="text" 
              placeholder={translateUI('search.placeholder')} 
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors ${theme === 'dark' ? 'bg-zinc-950 text-white border-zinc-700' : 'bg-slate-50 text-zinc-900 border-zinc-300'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/search?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
                }
              }}
            />
          </div>
        </div>
      )}
      <main className="flex-grow pt-16">
        <Outlet context={{ theme }} />
      </main>
      <footer className={`py-12 border-t text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-slate-100 border-zinc-200 text-zinc-600'}`}>
        <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-750'}`}>programetv.online</p>
        <p className="text-xs max-w-xl mx-auto mb-6 leading-relaxed opacity-85">
          {translateUI('footer.description')}
        </p>
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 text-sm mb-6 font-medium">
          <Link to="/" className={`hover:text-amber-500 font-bold transition-all ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'}`}>Live TV</Link>
          <Link to="/schedule" className="hover:text-amber-500 font-bold transition-colors">{translateUI('nav.schedule')}</Link>
          <Link to="/shows" className={`hover:text-amber-500 font-bold transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'}`}>{translateUI('nav.shows')}</Link>
          <Link to="/news" className={`hover:text-amber-500 font-bold transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'}`}>{translateUI('nav.news')}</Link>
          <Link to="/world-cup" className="hover:text-amber-500 font-bold">{translateUI('nav.worldcup')}</Link>
        </div>
        <div className="border-t border-zinc-900/60 max-w-6xl mx-auto pt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs opacity-75">
          <Link to="/privacy-policy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms-of-service" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/cookie-policy" className="hover:text-zinc-400 transition-colors">Cookie Policy</Link>
          <span>•</span>
          <Link to="/dmca" className="hover:text-zinc-400 transition-colors">DMCA</Link>
          <span>•</span>
          <Link to="/copyright" className="hover:text-zinc-400 transition-colors">Copyright</Link>
          <span>•</span>
          <Link to="/disclaimer" className="hover:text-zinc-400 transition-colors">Disclaimer</Link>
          <span>•</span>
          <Link to="/accessibility" className="hover:text-zinc-400 transition-colors">Accessibility</Link>
          <span>•</span>
          <Link to="/legal-contact" className="hover:text-zinc-400 transition-colors">Contact Legal</Link>
          <span>•</span>
          <Link to="/delete-my-data" className="hover:text-zinc-400 transition-colors">Delete My Data</Link>
        </div>
        <p className="mt-8 text-xs opacity-60">© {new Date().getFullYear()} programetv.online. Toate drepturile rezervate. Conform cu normele europene GDPR 2026.</p>
      </footer>
    </div>
  );
}
