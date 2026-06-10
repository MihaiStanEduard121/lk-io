import { useState } from 'react';
import { Image, Search, ShieldCheck, Download, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { api, getAuthToken } from '../../lib/api'; // Or use fetch directly

export default function MediaMetadata() {
  const [scanning, setScanning] = useState(false);
  const [force, setForce] = useState(true); // Default to true as the user explicitly wants them all updated!
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setScanning(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch(`/api/media/scan?force=${force}`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ force })
      });
      const data = await res.json();
      if (!data.success) {
         throw new Error(data.error || 'A apărut o eroare.');
      }
      setResults(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Media & Logo-uri</h1>
      <p className="text-zinc-400 mb-8">Setări pentru Data Engineering și procesarea imaginilor. Detectare și asociere automată de imagini, logo-uri canale și postere show-uri.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {results && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-6 rounded-xl mb-8">
           <h3 className="text-emerald-400 font-bold flex items-center mb-4">
             <ShieldCheck className="w-5 h-5 mr-2" />
             Scanare & Actualizare Completată
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
               <div className="text-xs text-emerald-500/70 font-bold uppercase mb-1">Total Canale</div>
               <div className="text-2xl font-bold text-emerald-400">{results.programsScanned}</div>
             </div>
             <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
               <div className="text-xs text-emerald-500/70 font-bold uppercase mb-1">Logo Canale Reparat</div>
               <div className="text-2xl font-bold text-emerald-400">{results.programsUpdated}</div>
             </div>
             <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
               <div className="text-xs text-emerald-500/70 font-bold uppercase mb-1">Total Seriale/Emisiuni</div>
               <div className="text-2xl font-bold text-emerald-400">{results.showsScanned}</div>
             </div>
             <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
               <div className="text-xs text-emerald-500/70 font-bold uppercase mb-1">Postere Reparate</div>
               <div className="text-2xl font-bold text-emerald-400">{results.showsUpdated}</div>
             </div>
           </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Scanare Automată Missing Art</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Sistemul va procesa toată baza de date. Dacă identifică programe TV sau seriale care nu au setată o imagine <code>thumbnail</code> sau logo, va interoga API-urile internaționale (Wikipedia, Wikimedia Commons, etc) pentru a prelua logo-ul oficial. 
              În cazul în care logo-ul oficial lipsește, se generează automat un placeholder vectorizat bazat pe numele canalului, cu culori din branding (folosind ui-avatars).
            </p>

            <div className="mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={force} 
                  onChange={(e) => setForce(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-800 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900" 
                />
                <span className="text-sm text-zinc-300 font-semibold select-none">Forțează înlocuirea tuturor logo-urilor existente cu cele sigure din PDF</span>
              </label>
            </div>
          </div>

          <button 
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Se procesează baza de date...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Scanează & Completează Golurile</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6">
            <Layers className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Optimizare Imagini & CDN</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Aici controlăm calitatea și formatul (Vite / Client side Lazy Loading). React va folosi automat un lazy-load fallback pe imaginile listate în catalog, și toate thumbnail-urile generate capătă structură completă <code>alt</code> și tag-uri SEO conform directivelor.
          </p>
          <div className="space-y-4">
             <div className="flex items-center text-sm text-zinc-300 bg-zinc-950 px-4 py-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2" />
                <span>Lazy Loading Image Pipeline Integrat</span>
             </div>
             <div className="flex items-center text-sm text-zinc-300 bg-zinc-950 px-4 py-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2" />
                <span>Fallback pe eroare imagine (placeholder automat)</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
