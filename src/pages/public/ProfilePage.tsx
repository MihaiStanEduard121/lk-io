import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check initial permission
    if (typeof Notification !== 'undefined') {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const toggleNotifications = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser-ul tău nu suportă notificări push.');
      return;
    }

    if (Notification.permission === 'granted') {
      alert('Notificările sunt deja activate.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      alert('Notificările au fost activate cu succes!');
    } else {
      alert('Permisiunea pentru notificări a fost refuzată.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold text-white mb-6">Profil Utilizator</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bell className="w-6 h-6 text-indigo-500" />
            <div>
              <h2 className="text-lg font-bold text-white">Notificări Push</h2>
              <p className="text-sm text-zinc-400">Primește alerte pentru meciurile preferate</p>
            </div>
          </div>
          <button
            onClick={toggleNotifications}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              notificationsEnabled 
                ? 'bg-indigo-600 text-white' 
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {notificationsEnabled ? 'Activat' : 'Activează'}
          </button>
        </div>
      </div>
    </div>
  );
}
