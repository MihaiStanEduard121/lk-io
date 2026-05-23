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
              <Link to="/" className="flex items-center space-x-2">
                <Tv className="h-8 w-8 text-indigo-500" />
                <span className="font-bold text-xl tracking-tight">StreamTV</span>
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
        <p>© {new Date().getFullYear()} StreamTV România. Toate drepturile rezervate.</p>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <Link to="/" className="hover:text-zinc-300">Live TV</Link>
          <Link to="/schedule" className="hover:text-amber-500 font-bold">Program TV</Link>
          <Link to="/shows" className="hover:text-zinc-300">Emisiuni</Link>
          <Link to="/news" className="hover:text-zinc-300">Știri</Link>
          <Link to="/admin/login" className="hover:text-zinc-300">Admin Panel</Link>
        </div>
      </footer>
    </div>
  );
}
