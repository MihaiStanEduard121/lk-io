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
      id: 'marketing',
      title: 'Promovare & Monetizare',
      links: [
        { to: '/adminadmin/ad-revenue', icon: TrendingUp, label: 'Venituri Reclame' },
        { to: '/adminadmin/popups', icon: Bell, label: 'Pop-up Global' },
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <Link to="/" className="text-xl font-black text-slate-900 tracking-wider flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-sm text-white font-black shadow-md shadow-indigo-600/30">TV</span>
          <span>ADMIN</span>
        </Link>
        <button 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="md:hidden p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Real-time search filter */}
      <div className="px-4 pt-4 pb-2 relative">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Caută în administrări..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 py-0.5 px-1.5 bg-slate-200 rounded text-[9px] font-extrabold"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="space-y-1.5" id={`group-${group.id}`}>
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.links.map((link) => {
                const active = link.exact 
                  ? location.pathname === link.to 
                  : location.pathname.startsWith(link.to);
                return (
                  <Link 
                    key={link.to} 
                    to={link.to}
                    id={`link-${link.to.split('/').pop() || 'dash'}`}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group ${
                      active 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold border-l-4 border-indigo-600 pl-3' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <link.icon className={`h-4.5 w-4.5 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                      <span className="text-sm">{link.label}</span>
                    </div>
                    {active && <ChevronRight className="h-4 w-4 text-indigo-600" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            Niciun link nu se potrivește cu „{searchQuery}”.
          </div>
        )}
      </nav>

      {/* Profile & Logout Section */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
        {currentUser && (
          <div className="flex items-center space-x-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black uppercase text-sm border border-indigo-200">
              {currentUser.email ? currentUser.email[0] : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.email || 'Admin'}</p>
              <span className="inline-flex px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/80 rounded mt-0.5">
                ADMIN SECURE
              </span>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          id="btn-admin-logout"
          className="flex w-full items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer text-sm font-bold"
        >
          <LogOut className="h-4 w-4" />
          <span>Deconectare</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Desktop Sidebar (Medium Screens and Up) */}
      <aside className="hidden md:flex md:w-64 flex-col shrink-0 h-screen sticky top-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header (Hidden on Desktop) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <Link to="/" className="text-lg font-black text-slate-900 tracking-wider flex items-center space-x-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs text-white font-black">TV</span>
          <span>ADMIN</span>
        </Link>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)} 
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] h-full flex flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-250 z-10">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Outlet />
      </main>
    </div>
  );
}

