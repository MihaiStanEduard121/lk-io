import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertOctagon, HelpCircle, ArrowRight, Home, RefreshCw } from 'lucide-react';

export default function PresenceTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ejected, setEjected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Reset ejection status when changing pages
    setEjected(false);
    setErrorMessage('');

    // Generate/retrieve clientId to identify unique sessions
    let clientId = sessionStorage.getItem('presence_client_id');
    if (!clientId) {
      clientId = 'viewer_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('presence_client_id', clientId);
    }

    const sendPing = async () => {
      try {
        const response = await fetch('/api/presence/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            page: location.pathname || '/',
            isAdmin: location.pathname.startsWith('/adminadmin')
          })
        });
        const data = await response.json();
        if (data.success === false && data.error === 'limit_reached') {
          setEjected(true);
          setErrorMessage(data.message || 'Această pagină este temporar indisponibilă din cauza numărului mare de accesări.');
        }
      } catch (err) {
        // Silently ignore ping errors
      }
    };

    // Ping immediately on navigation
    sendPing();

    // Setup interval to ping every 8 seconds (slightly faster to react quickly to limit updates)
    const interval = setInterval(sendPing, 8000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  if (ejected) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[99999] flex items-center justify-center p-4 select-none">
        <div className="bg-zinc-950 border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/5 text-center relative overflow-hidden">
          {/* Subtle red decoration banner block */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
          
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-8 h-8 animate-bounce" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight mb-3">
            Flux maxim de cititori atins
          </h2>
          
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {errorMessage}
          </p>

          <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-left text-xs mb-6 text-zinc-400 space-y-2">
            <div className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span>Protecție automată anti DDoS / supra-solicitare activă.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span>Poți reîncerca peste câteva momente sau explora alte secțiuni.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setEjected(false);
                navigate('/');
              }}
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-medium text-xs py-3 px-4 rounded-xl border border-zinc-800 transition-colors"
            >
              <Home className="w-4 h-4 text-zinc-500" />
              Pagina Principală
            </button>
            <button
              onClick={() => {
                setEjected(false);
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-500/10"
            >
              <RefreshCw className="w-4 h-4 text-white/90" />
              Reîncearcă
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
