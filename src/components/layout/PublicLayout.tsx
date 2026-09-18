import { Outlet, Link, useLocation } from 'react-router-dom';
import { Tv, Search, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector';
import GlobalPopup from '../GlobalPopup';
import DonateButton from '../DonateButton';
import AdBanner from '../AdBanner';

export default function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
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
      <DonateButton />
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b ${theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/90 border-slate-200/80 shadow-xs'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <img src="/src/assets/images/modern_tv_logo_1781111684612.png" alt="programetv.online Logo" className="h-8 w-auto rounded opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
                <span className={`font-black text-xl tracking-tight hidden sm:block bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-white to-zinc-400' : 'from-indigo-950 via-indigo-900 to-indigo-600'}`}>programetv.online</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6 text-sm font-bold">
                <Link to="/" className={`${location.pathname === '/' ? (theme === 'dark' ? 'text-white font-black' : 'text-indigo-600 font-black') : (theme === 'dark' ? 'text-zinc-400 hover:text-white transition-colors' : 'text-slate-600 hover:text-indigo-600 transition-colors')}`}>{translateUI('nav.home')}</Link>
                <Link to="/schedule" className={`${location.pathname.startsWith('/schedule') ? (theme === 'dark' ? 'text-white font-black' : 'text-indigo-600 font-black') : (theme === 'dark' ? 'text-zinc-400 hover:text-white transition-colors' : 'text-slate-600 hover:text-indigo-600 transition-colors')}`}>{translateUI('nav.schedule')}</Link>
                <Link to="/shows" className={`${location.pathname.startsWith('/shows') ? (theme === 'dark' ? 'text-white font-black' : 'text-indigo-600 font-black') : (theme === 'dark' ? 'text-zinc-400 hover:text-white transition-colors' : 'text-slate-600 hover:text-indigo-600 transition-colors')}`}>{translateUI('nav.shows')}</Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Theme Toggle Switch */}
              <button onClick={toggleTheme} className={`p-2 rounded-xl transition-colors cursor-pointer select-none ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
              </button>
              
              <Link to="/profile" className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <User className="h-5 w-5" />
              </Link>
              <LanguageSelector />
              <button onClick={() => setSearchOpen(!searchOpen)} className={`p-2 rounded-xl transition-colors select-none cursor-pointer ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {searchOpen && (
        <div className={`fixed top-16 w-full z-40 border-b p-4 shadow-xl transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <div className="max-w-3xl mx-auto">
            <input 
              autoFocus
              type="text" 
              placeholder={translateUI('search.placeholder')} 
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors ${theme === 'dark' ? 'bg-zinc-950 text-white border-zinc-700' : 'bg-slate-50 text-slate-900 border-slate-300'}`}
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

      <div className="max-w-7xl mx-auto px-4 w-full">
        <AdBanner zoneId="11835805" format="horizontal" className="my-4" />
      </div>

      <footer className={`py-12 border-t text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-white border-slate-200 text-slate-600'}`}>
        <p className={`font-extrabold text-lg mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-900'}`}>programetv.online</p>
        <p className="text-xs max-w-xl mx-auto mb-6 leading-relaxed opacity-85">
          {translateUI('footer.description')}
        </p>
        <div className="flex justify-center flex-wrap gap-x-8 gap-y-3 text-sm mb-6 font-bold">
          <Link to="/" className={`hover:text-indigo-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-700'}`}>Live TV</Link>
          <Link to="/schedule" className={`hover:text-indigo-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-700'}`}>{translateUI('nav.schedule')}</Link>
          <Link to="/shows" className={`hover:text-indigo-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-700'}`}>{translateUI('nav.shows')}</Link>
        </div>
        <div className={`border-t max-w-6xl mx-auto pt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium ${theme === 'dark' ? 'border-zinc-900 text-zinc-500' : 'border-slate-100 text-slate-500'}`}>
          <Link to="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms-of-service" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/cookie-policy" className="hover:text-indigo-600 transition-colors">Cookie Policy</Link>
          <span>•</span>
          <Link to="/dmca" className="hover:text-indigo-600 transition-colors">DMCA</Link>
          <span>•</span>
          <Link to="/copyright" className="hover:text-indigo-600 transition-colors">Copyright</Link>
          <span>•</span>
          <Link to="/disclaimer" className="hover:text-indigo-600 transition-colors">Disclaimer</Link>
          <span>•</span>
          <Link to="/accessibility" className="hover:text-indigo-600 transition-colors">Accessibility</Link>
          <span>•</span>
          <Link to="/legal-contact" className="hover:text-indigo-600 transition-colors">Contact Legal</Link>
          <span>•</span>
          <Link to="/delete-my-data" className="hover:text-indigo-600 transition-colors">Delete My Data</Link>
        </div>
        <p className="mt-8 text-xs text-slate-400 font-medium">© {new Date().getFullYear()} programetv.online. Toate drepturile rezervate. Conform cu normele europene GDPR 2026.</p>
      </footer>
    </div>
  );
}
