import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PresenceTracker() {
  const location = useLocation();

  useEffect(() => {
    // Generate/retrieve clientId to identify unique sessions
    let clientId = sessionStorage.getItem('presence_client_id');
    if (!clientId) {
      clientId = 'viewer_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('presence_client_id', clientId);
    }

    const sendPing = async () => {
      try {
        await fetch('/api/presence/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            page: location.pathname || '/',
            isAdmin: location.pathname.startsWith('/adminadmin')
          })
        });
      } catch (err) {
        // Silently ignore ping errors
      }
    };

    // Ping immediately on navigation
    sendPing();

    // Setup interval to ping every 12 seconds
    const interval = setInterval(sendPing, 12000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  return null;
}
