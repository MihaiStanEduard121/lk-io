import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Gift, Info, CheckCircle2 } from 'lucide-react';

export default function GlobalPopup() {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    // Lazy fetch popup config
    api.getPopupConfig().then((data) => {
      if (!data || !data.active) return;
      setConfig(data);

      const storageKey = `popup_shown_${data.title ? data.title.replace(/\s+/g, '_') : 'default'}`;
      
      const shouldShow = () => {
        if (data.triggerType === 'once') {
          return !localStorage.getItem(storageKey);
        } else if (data.triggerType === 'always') {
          return !sessionStorage.getItem(storageKey);
        }
        return !localStorage.getItem(storageKey); // default once
      };

      if (shouldShow()) {
        if (data.triggerType === 'delay') {
          const delay = (data.delaySeconds || 5) * 1000;
          const timer = setTimeout(() => {
            setShow(true);
          }, delay);
          return () => clearTimeout(timer);
        } else {
          setShow(true);
        }
      }
    }).catch(err => {
      console.warn('Could not load global popup:', err);
    });
  }, []);

  const handleClose = () => {
    setShow(false);
    if (config) {
      const storageKey = `popup_shown_${config.title ? config.title.replace(/\s+/g, '_') : 'default'}`;
      if (config.triggerType === 'once' || config.triggerType === 'delay') {
        localStorage.setItem(storageKey, 'true');
      } else if (config.triggerType === 'always') {
        sessionStorage.setItem(storageKey, 'true');
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailSubscribed(true);
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!config || !show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 max-w-md w-full relative overflow-hidden shadow-2xl"
        >
          {/* Subtle glowing decoration background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button 
            id="btn_close_global_popup"
            onClick={handleClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs font-bold font-mono px-2 py-1 rounded bg-zinc-950/40 border border-zinc-800/40"
          >
            ✕ ÎNCHIDE
          </button>

          <div className="mt-4">
            {/* Type specifier tag/icon */}
            <div className="mb-4">
              {config.type === 'info' && (
                <span className="flex items-center space-x-1.5 text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider w-fit">
                  <Info className="w-3.5 h-3.5" />
                  <span>Anunț Util</span>
                </span>
              )}
              {config.type === 'donation' && (
                <span className="flex items-center space-x-1.5 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider w-fit">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Susține-ne</span>
                </span>
              )}
              {config.type === 'newsletter' && (
                <span className="flex items-center space-x-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider w-fit">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Buletin Știri</span>
                </span>
              )}
              {config.type === 'promo' && (
                <span className="flex items-center space-x-1.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider w-fit">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Promoție Specială</span>
                </span>
              )}
            </div>

            {/* Configured Promo image */}
            {config.type === 'promo' && config.imageUrl && (
              <img 
                src={config.imageUrl} 
                alt="Promotion"
                className="w-full h-36 object-cover rounded-xl mb-4 bg-zinc-950 border border-zinc-800"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            )}

            <h3 className="text-xl font-black text-white mb-3 tracking-tight leading-snug">{config.title}</h3>
            <p className="text-zinc-300 text-xs leading-relaxed mb-6 whitespace-pre-wrap">{config.content}</p>

            {/* Newsletter input layout */}
            {config.type === 'newsletter' && (
              <form onSubmit={handleSubscribe} className="space-y-3 mb-6">
                {emailSubscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-xs font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Te-ai abonat cu succes!</span>
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Adresa ta de email..." 
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none transition-colors" 
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer select-none">
                      Abonare
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Action buttons */}
            {config.linkUrl && config.linkText && !emailSubscribed && (
              <div className="flex justify-end pt-4 border-t border-zinc-850">
                <a
                  href={config.linkUrl}
                  onClick={handleClose}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/15"
                >
                  <span>{config.linkText}</span>
                  <Sparkles className="w-3.5 h-3.5 fill-current text-white/90" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
