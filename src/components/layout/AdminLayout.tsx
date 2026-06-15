import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Film, FileText, MonitorPlay, LogOut, Settings, Hash, 
  MessageSquare, CalendarClock, Globe, Users, TrafficCone, Image, Award, 
  TrendingUp, Bell, Sparkles, Menu, X, Search, ChevronRight 
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface NavLinkItem {
  to: string;
  icon: any;
  label: string;
  exact?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  links: NavLinkItem[];
}

export default function AdminLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/';
  };

  const navGroups: NavGroup[] = [
    {
      id: 'core',
      title: 'Meniu Principal',
      links: [
        { to: '/adminadmin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/adminadmin/live-presence', icon: Users, label: 'Utilizatori Live' },
      ]
    },
    {
      id: 'tv',
      title: 'Programe & Catalog TV',
      links: [
        { to: '/adminadmin/programs', icon: Film, label: 'Programe Live' },
        { to: '/adminadmin/program-categories', icon: Hash, label: 'Categorii Canale' },
        { to: '/adminadmin/tv-schedule', icon: CalendarClock, label: 'Program TV' },
        { to: '/adminadmin/shows', icon: MonitorPlay, label: 'Emisiuni (VOD)' },
      ]
    },
    {
      id: 'news',
      title: 'Articole & Știri',
      links: [
        { to: '/adminadmin/news', icon: FileText, label: 'Știri / Articole' },
        { to: '/adminadmin/categories', icon: Hash, label: 'Categorii Ştiri' },
        { to: '/adminadmin/article-generator', icon: Sparkles, label: 'Generator Articole' },
        { to: '/adminadmin/comments', icon: MessageSquare, label: 'Comentarii' },
      ]
    },
    {
      id: 'marketing',
      title: 'Promovare & Monetizare',
      links: [
        { to: '/adminadmin/ad-revenue', icon: TrendingUp, label: 'Venituri Reclame' },
        { to: '/adminadmin/popups', icon: Bell, label: 'Pop-up Global' },
        { to: '/adminadmin/world-cup', icon: Award, label: 'Meciuri Cupă' },
      ]
    },
    {
      id: 'system',
      title: 'Setări & Optimizări',
      links: [
        { to: '/adminadmin/scraper', icon: Globe, label: 'Auto Scraper' },
        { to: '/adminadmin/redirects', icon: TrafficCone, label: 'Redirecționări SEO' },
        { to: '/adminadmin/media', icon: Image, label: 'Media & Logo-uri' },
        { to: '/adminadmin/settings', icon: Settings, label: 'Setări Site' },
      ]
    }
  ];

  // Search Filter over Links
  const filteredGroups = navGroups.map(group => {
    const matchedLinks = group.links.filter(link => 
      link.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...group,
      links: matchedLinks
    };
  }).filter(group => group.links.length > 0);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-900/90 md:bg-zinc-900/50">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <Link to="/" className="text-xl font-black text-white tracking-widest flex items-center space-x-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm text-white font-black shadow-lg shadow-indigo-600/35">TV</span>
          <span>ADMIN</span>
        </Link>
        <button 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="md:hidden p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Real-time search filter */}
      <div className="px-4 pt-4 pb-2 relative">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Caută în administrări..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 hover:border-zinc-700 focus:outline-none focus:border-indigo-600 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 py-0.5 px-1 bg-zinc-800/50 rounded text-[9px] font-bold"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {filteredGroups.map((group) => (
          <div key={group.id} className="space-y-1" id={`group-${group.id}`}>
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const active = link.exact 
                  ? location.pathname === link.to 
                  : location.pathname.startsWith(link.to);
                return (
                  <Link 
                    key={link.to} 
                    to={link.to}
                    id={`link-${link.to.split('/').pop() || 'dash'}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                      active 
                        ? 'bg-indigo-600/10 text-white font-bold border-l-2 border-indigo-500 pl-4' 
                        : 'text-zinc-400 hover:bg-zinc-802 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <link.icon className={`h-4.5 w-4.5 transition-colors ${active ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                      <span className="text-sm">{link.label}</span>
                    </div>
                    {active && <ChevronRight className="h-3.5 w-3.5 text-indigo-400/80" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-xs">
            Niciun link nu se potrivește cu „{searchQuery}”.
          </div>
        )}
      </nav>

      {/* Profile & Logout Section */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/20 space-y-3">
        {currentUser && (
          <div className="flex items-center space-x-3 px-3 py-2 bg-zinc-950/40 border border-zinc-800/50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black uppercase text-sm border border-indigo-500/20">
              {currentUser.email ? currentUser.email[0] : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.email || 'Admin'}</p>
              <span className="inline-flex px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded mt-0.5">
                ADMIN SECURE
              </span>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          id="btn-admin-logout"
          className="flex w-full items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-colors pointer-cursor text-sm font-bold"
        >
          <LogOut className="h-4 w-4" />
          <span>Deconectare</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-300">
      {/* Desktop Sidebar (Medium Screens and Up) */}
      <aside className="hidden md:flex md:w-64 border-r border-zinc-800 flex-col shrink-0 h-screen sticky top-0 bg-zinc-900/40">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header (Hidden on Desktop) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-30 backdrop-blur-md">
        <Link to="/" className="text-lg font-black text-white tracking-widest flex items-center space-x-2">
          <span className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-xs text-white font-black">TV</span>
          <span>ADMIN</span>
        </Link>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)} 
          className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] h-full flex flex-col bg-zinc-900 shadow-2xl animate-in slide-in-from-left duration-250 z-10">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

