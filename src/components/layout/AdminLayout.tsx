import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, FileText, MonitorPlay, LogOut, Settings, Hash, MessageSquare, CalendarClock } from 'lucide-react';
import { getAuthToken } from '../../lib/api';

export default function AdminLayout() {
  const location = useLocation();

  const handleLogout = async () => {
    window.location.href = '/';
  };

  const navLinks = [
    { to: '/adminadmin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/adminadmin/programs', icon: Film, label: 'Programe Live' },
    { to: '/adminadmin/shows', icon: MonitorPlay, label: 'Emisiuni (VOD)' },
    { to: '/adminadmin/news', icon: FileText, label: 'Știri / Articole' },
    { to: '/adminadmin/tv-schedule', icon: CalendarClock, label: 'Program TV' },
    { to: '/adminadmin/categories', icon: Hash, label: 'Categorii Ştiri' },
    { to: '/adminadmin/comments', icon: MessageSquare, label: 'Comentarii' },
    { to: '/adminadmin/settings', icon: Settings, label: 'Setări Site' },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-300">
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <Link to="/" className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm">TV</span>
            <span>Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const active = link.exact 
              ? location.pathname === link.to 
              : location.pathname.startsWith(link.to);
            return (
              <Link 
                key={link.to} 
                to={link.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  active ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Deconectare</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
