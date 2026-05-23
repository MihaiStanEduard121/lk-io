import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Play, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function ScraperSettings() {
  const [config, setConfig] = useState<any>({ active: false, targetUrl: '', intervalStr: '*/5 * * * *' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/scraper/config')
      .then(r => r.json())
      .then(data => {
        if (data.success !== false) {
          setConfig(data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scraper/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Setările au fost salvate cu succes.', type: 'success' });
      } else {
        setMsg({ text: data.message || 'Eroare la salvare', type: 'error' });
      }
    } catch(err:any) {
      setMsg({ text: err.message, type: 'error' });
    }
    setLoading(false);
  };

  const handleRun = async () => {
    if (!config.targetUrl) {
      setMsg({ text: 'Vă rugăm să introduceți un URL Sursă înainte de a porni manual!', type: 'error' });
      return;
    }
    setLoading(true);
    setMsg({ text: 'Rulare scraper pornită...', type: 'info' });
    try {
      const res = await fetch('/api/scraper/run', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: config.targetUrl, force: true })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message, type: 'success' });
      } else {
        setMsg({ text: data.message || 'Eroare la rulare', type: 'error' });
      }
    } catch(err:any) {
       setMsg({ text: err.message, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent flex items-center">
          <Settings className="w-8 h-8 mr-3 text-indigo-400" />
          Auto Scraper - Import Articole
        </h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl">
        {msg.text && (
          <div className={`p-4 rounded-lg mb-6 flex items-center ${msg.type === 'success' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'}`}>
            {msg.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3"/>}
            {msg.text}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-zinc-400 mb-2">
              <input 
                type="checkbox" 
                checked={config.active || false} 
                onChange={(e) => setConfig({...config, active: e.target.checked})}
                className="mr-3 w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-indigo-500 focus:ring-indigo-500"
              />
              Activează Auto Scraper (Cron Job)
            </label>
            <p className="text-xs text-zinc-500 ml-8">Dacă este bifat, serverul va rula scraping-ul automat la intervalul prestabilit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">URL Sursă (ex: pagina cu Noutăți)</label>
            <input 
              type="url" 
              value={config.targetUrl || ''} 
              onChange={e => setConfig({...config, targetUrl: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              placeholder="https://exemplu.ro/noutati"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Interval Cron (ex: */5 * * * * pt. 5 minute)</label>
            <input 
              type="text" 
              value={config.intervalStr || ''} 
              onChange={e => setConfig({...config, intervalStr: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvează Setările
            </button>

            <button 
              onClick={handleRun} 
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Pornește Manual Acum
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
