import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { 
  Bell, Eye, Play, Save, CheckCircle, AlertTriangle, 
  Settings, Info, Gift, Mail, Sparkles, Layout, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PopupManager() {
  const [config, setConfig] = useState<any>({
    active: false,
    type: 'info', // 'info' | 'donation' | 'newsletter' | 'promo'
    title: 'Anunț Important',
    content: 'Bine ai venit pe platforma noastră! Dacă apreciezi munca noastră, ne poți susține printr-o mică donație.',
    imageUrl: '',
    linkUrl: '/donations',
    linkText: 'Donează acum',
    triggerType: 'once', // 'once' | 'delay' | 'always'
    delaySeconds: 5,
    cookieExpiryDays: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    api.getPopupConfig().then((data) => {
      setConfig(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updatePopupConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Eroare la salvarea configurației!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-zinc-500">Se încarcă setările ferestrei modal...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2.5">
          <Bell className="w-8 h-8 text-amber-500" />
          <span>Configurator Pop-up Global</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configurează ferestrele modale (pop-up) afișate publicului larg, pentru a promova donațiile, parteneriatele sau noutățile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <h3 className="font-bold text-white flex items-center space-x-2">
              <Settings className="w-4 h-4 text-zinc-400" />
              <span>Proprietăți Pop-up</span>
            </h3>

            <button
              type="button"
              onClick={() => setConfig({ ...config, active: !config.active })}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                config.active 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {config.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{config.active ? 'Status: ACTIV' : 'Status: INACTIV'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pop-up type selector */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Tip Eveniment Pop-up</label>
              <select
                value={config.type}
                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="info">Mesaj Informativ standard</option>
                <option value="donation">Promovare Donații (PayPal/Revolut)</option>
                <option value="newsletter">Abonare la Buletin Știri</option>
                <option value="promo">Anunț Promoțional cu IMAGINE</option>
              </select>
            </div>

            {/* Trigger selection */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Regulă de Afișare</label>
              <select
                value={config.triggerType}
                onChange={(e) => setConfig({ ...config, triggerType: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="once">O singură dată, la prima accesare</option>
                <option value="delay">Cu cronometru (întârziere)</option>
                <option value="always">La fiecare sesiune nouă</option>
              </select>
            </div>
          </div>

          {config.triggerType === 'delay' && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Întârziere cronometru (secunde)</label>
              <input
                type="number"
                min="1"
                max="300"
                value={config.delaySeconds}
                onChange={(e) => setConfig({ ...config, delaySeconds: parseInt(e.target.value) || 5 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Titlu Pop-up</label>
            <input
              type="text"
              required
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Ex: Tehnologia live s-a schimbat!"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Conținut Text Pop-up</label>
            <textarea
              rows={4}
              required
              value={config.content}
              onChange={(e) => setConfig({ ...config, content: e.target.value })}
              placeholder="Introdu mesajul principal pentru utilizatorii tăi..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-101 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {config.type === 'promo' && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">URL Imagine Promovare</label>
              <input
                type="url"
                value={config.imageUrl || ''}
                onChange={(e) => setConfig({ ...config, imageUrl: e.target.value })}
                placeholder="https://exemplu.ro/banner.jpg"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">URL Link / Destinație Buton</label>
              <input
                type="text"
                value={config.linkUrl || ''}
                onChange={(e) => setConfig({ ...config, linkUrl: e.target.value })}
                placeholder="Ex: /donations"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Text Buton Acțiune</label>
              <input
                type="text"
                value={config.linkText || ''}
                onChange={(e) => setConfig({ ...config, linkText: e.target.value })}
                placeholder="Ex: Donează Acum"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-850 justify-between items-center">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 px-4 py-2.5 rounded-xl transition-all font-semibold text-xs cursor-pointer"
            >
              <Eye className="w-4 h-4 text-zinc-400" />
              <span>Arată Previziune Directă</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/2 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Se salvează...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvează setările</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl block text-xs font-bold"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Configurațiile au fost integrate cu succes în baza de date Cloud!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Live Card simulation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center space-x-1.5 pb-2 border-b border-zinc-850">
              <Layout className="w-3.5 h-3.5 text-zinc-500" />
              <span>Simulare Vizuală Pop-up pe site</span>
            </h4>

            {/* Inner popup drawer simulator */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden mt-3 shadow-inner shadow-black/80">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] bg-indigo-600/20 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  {config.type}
                </span>
                <span className="text-zinc-500 hover:text-zinc-400 text-xs font-bold cursor-not-allowed">✕</span>
              </div>

              {config.type === 'promo' && config.imageUrl && (
                <img 
                  src={config.imageUrl} 
                  alt="Promo banner" 
                  className="w-full h-24 object-cover rounded-lg mb-4 bg-zinc-900 border border-zinc-850" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}

              <h2 className="text-base font-extrabold text-white mb-2 leading-snug">
                {config.title || 'Fără Titlu Configurat'}
              </h2>

              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4 whitespace-pre-wrap">
                {config.content || 'Fără text introdus în configurator.'}
              </p>

              {config.type === 'newsletter' && (
                <div className="flex space-x-2 mb-4">
                  <input 
                    disabled 
                    type="email" 
                    placeholder="Adresa ta de email" 
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-500 focus:outline-none" 
                  />
                  <button disabled className="bg-indigo-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] opacity-80 cursor-not-allowed">Abonare</button>
                </div>
              )}

              {config.linkUrl && config.linkText && (
                <div className="pt-2 border-t border-zinc-900/60 flex justify-end">
                  <span className="bg-indigo-600 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] tracking-wide inline-flex items-center space-x-1 shadow-md shadow-indigo-600/10 cursor-not-allowed">
                    <span>{config.linkText}</span>
                    <Sparkles className="w-3 h-3 text-white fill-current" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actual popup preview container */}
      <AnimatePresence>
        {previewOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <button 
                onClick={() => setPreviewOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                ✕ Închide previzualizarea
              </button>

              <div className="mt-4">
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 mb-4 inline-block">
                  {config.type.toUpperCase()}
                </span>

                {config.type === 'promo' && config.imageUrl && (
                  <img 
                    src={config.imageUrl} 
                    alt="Promo Preview" 
                    className="w-full h-32 object-cover rounded-xl mb-4 bg-zinc-950 border border-zinc-800"
                  />
                )}

                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{config.title}</h3>
                <p className="text-zinc-300 text-xs leading-relaxed mb-6 whitespace-pre-wrap">{config.content}</p>

                {config.type === 'newsletter' && (
                  <div className="flex space-x-2 mb-6">
                    <input 
                      disabled
                      type="email" 
                      placeholder="Adresa ta de email..." 
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-500" 
                    />
                    <button disabled className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs opacity-70">Abonare</button>
                  </div>
                )}

                {config.linkUrl && config.linkText && (
                  <div className="flex justify-end pt-4 border-t border-zinc-850">
                    <a
                      href={config.linkUrl}
                      onClick={(e) => { e.preventDefault(); setPreviewOpen(false); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/15"
                    >
                      <span>{config.linkText}</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
