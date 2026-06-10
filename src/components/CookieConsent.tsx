import { useState, useEffect } from 'react';
import { Shield, Settings, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true
  });

  useEffect(() => {
    // Check if user already made choices
    const savedConsent = localStorage.getItem('programetv_cookie_consent_2026');
    if (!savedConsent) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('programetv_cookie_consent_2026', JSON.stringify(prefs));
    
    // Apply triggers (e.g. disable/enable Google Analytics based on prefs.analytics)
    if (!prefs.analytics) {
      // Opt out of Google Analytics if initialized in window
      (window as any)['ga-disable-UA-XXXXXXXXX-X'] = true;
    }
    
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setPreferences(fullConsent);
    saveConsent(fullConsent);
  };

  const handleRejectAll = () => {
    const minConsent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setPreferences(minConsent);
    saveConsent(minConsent);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 bg-zinc-950 border-t border-zinc-900 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          id="cookie-consent-modal-root"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Context and Information */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Consimțământ Cookie & Confidențialitate</span>
              </div>
              <h4 className="text-white font-bold text-lg md:text-xl">Respectăm datele tale personale</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Noi și partenerii noștri de încredere utilizăm cookie-uri pentru operarea tehnică a site-ului, analizarea traficului, reținerea preferințelor din programul TV și optimizarea publicității conform directivelor europene GDPR din anul <strong>2026</strong>. Poți selecta mai jos opțiunea dorită.
              </p>
              <div className="pt-2 text-xs text-zinc-500 font-medium">
                Detaliat în: <a href="/cookie-policy" className="text-indigo-400 hover:underline">Politica de Cookie-uri</a> și <a href="/privacy-policy" className="text-indigo-400 hover:underline">Politica de Confidențialitate</a>.
              </div>
            </div>

            {/* Actions Panel */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="flex items-center justify-center space-x-2 px-5 py-3 border border-zinc-800 bg-zinc-900 rounded-xl text-zinc-300 font-semibold text-sm hover:text-white hover:border-zinc-700 transition"
              >
                <Settings className="w-4 h-4" />
                <span>Personalizează</span>
              </button>
              
              <button
                onClick={handleRejectAll}
                className="px-5 py-3 border border-zinc-800 bg-zinc-900 rounded-xl text-zinc-300 font-semibold text-sm hover:text-red-400 hover:border-red-500/20 transition"
              >
                Refuză tot
              </button>

              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-1"
              >
                <span>Acceptă Toate</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Preferences Customizer Panel */}
          {showCustomize && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-7xl mx-auto border-t border-zinc-900/80 mt-6 pt-6 overflow-hidden"
              id="cookie-customizer-panel"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                
                {/* Category 1: Necessary */}
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-white font-bold text-sm">1. Cookie-uri Obligatorii</h5>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold">Necesar</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Sunt absolut esențiale pentru navigarea corectă, securitate completă SSL, formulare legale securizate și autentificarea în siguranță cu contul tău Firebase. Nu pot fi dezactivate.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-emerald-500 text-xs font-bold gap-1">
                    <Check className="w-4 h-4" /> Activ în permanență
                  </div>
                </div>

                {/* Category 2: Functional */}
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-white font-bold text-sm">2. Cookie-uri Funcționale</h5>
                      <button 
                        onClick={() => togglePreference('functional')}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border transition ${preferences.functional ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                      >
                        {preferences.functional ? 'Activat' : 'Dezactivat'}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Permit reținerea anumitor opțiuni pe care le faci pe site, cum ar fi canalul pe care l-ai vizualizat ultima dată și redeschiderea facilă a playerului externalizat.
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.functional}
                        onChange={() => togglePreference('functional')}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      <span className="ml-2 text-xs font-semibold text-zinc-400">Permite utilizarea</span>
                    </label>
                  </div>
                </div>

                {/* Category 3: Analytics */}
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-white font-bold text-sm">3. Cookie-uri Analitice</h5>
                      <button 
                        onClick={() => togglePreference('analytics')}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border transition ${preferences.analytics ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                      >
                        {preferences.analytics ? 'Activat' : 'Dezactivat'}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Ne ajută să înțelegem cum navighează vizitatorii pe programetv.online (Google Analytics, statistici de trafic). Ne arată ce emisiuni și canale TV sunt cele mai accesate, permițându-ne ajustarea serverelor.
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.analytics}
                        onChange={() => togglePreference('analytics')}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      <span className="ml-2 text-xs font-semibold text-zinc-400">Permite utilizarea</span>
                    </label>
                  </div>
                </div>

                {/* Category 4: Marketing */}
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-white font-bold text-sm">4. Cookie-uri Publicitare</h5>
                      <button 
                        onClick={() => togglePreference('marketing')}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border transition ${preferences.marketing ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                      >
                        {preferences.marketing ? 'Activat' : 'Dezactivat'}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Folosite de partenerii noștri (rețele de publicitate Adsense/parteneri) pentru a-ți livra reclame relevante, adaptate preferințelor tale, prevenind totodată repetarea excesivă a aceleiași reclame.
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.marketing}
                        onChange={() => togglePreference('marketing')}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      <span className="ml-2 text-xs font-semibold text-zinc-400">Permite utilizarea</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Save Custom Preferences Button */}
              <div className="flex justify-end pt-4 border-t border-zinc-900">
                <button
                  onClick={handleSaveCustom}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-lg text-xs transition uppercase tracking-wider flex items-center space-x-1"
                >
                  <span>Salvează Preferințele Mele Selected</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
