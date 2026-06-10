import { Outlet, Link, useLocation } from 'react-router-dom';
import { Tv, Search } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 border-border">
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3">
                <img src="/src/assets/images/modern_tv_logo_1781111684612.png" alt="programetv.online Logo" className="h-8 w-auto rounded opacity-90 hover:opacity-100 transition-opacity drop-shadow-md" />
                <span className="font-bold text-xl tracking-tight hidden sm:block bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">programetv.online</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link to="/" className={`${location.pathname === '/' ? 'text-white' : 'text-zinc-400 hover:text-white transition-colors'}`}>Acasă</Link>
                <Link to="/schedule" className={`${location.pathname.startsWith('/schedule') ? 'text-white' : 'text-zinc-400 hover:text-white transition-colors'}`}>Program TV</Link>
                <Link to="/shows" className={`${location.pathname.startsWith('/shows') ? 'text-white' : 'text-zinc-400 hover:text-white transition-colors'}`}>Emisiuni (VOD)</Link>
                <Link to="/news" className={`${location.pathname.startsWith('/news') ? 'text-white' : 'text-zinc-400 hover:text-white transition-colors'}`}>Știri</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {searchOpen && (
        <div className="fixed top-16 w-full z-40 bg-zinc-900 border-b border-zinc-800 p-4 shadow-xl">
          <div className="max-w-3xl mx-auto">
            <input 
              autoFocus
              type="text" 
              placeholder="Caută emisiuni, filme, canale, articole..." 
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
        <Outlet />
      </main>
      <footer className="py-12 bg-zinc-950 border-t border-zinc-900 text-center text-zinc-500">
        <p className="text-zinc-400 font-semibold mb-2">programetv.online</p>
        <p className="text-xs max-w-xl mx-auto mb-6 text-zinc-650 leading-relaxed">
          programetv.online este un agregator independent de ghiduri TV și recenzii emisiuni. Redările video se realizează exclusiv prin elemente de încorporare iframe din rețele publice libere externe. Toate drepturile de marcă aparțin deținătorilor legitimi.
        </p>
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 text-sm mb-6 font-medium">
          <Link to="/" className="hover:text-zinc-300">Live TV</Link>
          <Link to="/schedule" className="hover:text-amber-500 font-bold transition-colors">Program TV</Link>
          <Link to="/shows" className="hover:text-zinc-300">Emisiuni</Link>
          <Link to="/news" className="hover:text-zinc-300">Știri</Link>
          <Link to="/adminadmin" className="hover:text-zinc-350 underline decoration-indigo-500/50">Admin Panel</Link>
        </div>
        <div className="border-t border-zinc-900/60 max-w-6xl mx-auto pt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-zinc-650">
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
        <p className="mt-8 text-xs text-zinc-700">© {new Date().getFullYear()} programetv.online. Toate drepturile rezervate. Conform cu normele europene GDPR 2026.</p>
      </footer>
    </div>
  );
}
