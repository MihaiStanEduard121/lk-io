import React, { useState } from 'react';
import { useAppLanguage } from '../../context/LanguageContext';
import { Heart, Send, Check, ShieldCheck, HelpCircle, Gift, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DonationsPage() {
  const { translateUI } = useAppLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState<string>('');

  const revolutLink = "https://revolut.me/revutza";
  const paypalLink = "https://paypal.me/programetv";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  const getActiveLink = (baseUrl: string) => {
    const amount = selectedAmount || parseFloat(customAmount) || 10;
    return `${baseUrl}/${amount}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pt-28 pb-16 flex flex-col items-center px-4">
      {/* Title / Hero */}
      <div className="max-w-4xl w-full text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-1.5 rounded-full border border-rose-500/20 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
          <span>Susține Comunitatea Noastră</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mb-4">
          Pagina de Donații / Support Us
        </h1>
        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          programetv.online este un proiect independent, menținut cu eforturi proprii din pasiune pentru media și fotbal. Fiecare donație ne ajută să acoperim costurile de server și să oferim un ghid de încredere pentru meciuri și emisiuni.
        </p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left column: Donation selectors & Information */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Gift className="w-5 h-5 text-indigo-400" />
              <span>Alege Suma / Choose Amount</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-6 font-medium">Suma selectată va fi inclusă în link-urile de plată rapide.</p>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedAmount === amt
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  {amt} Lei
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Altă sumă (Lei) / Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setSelectedAmount(null);
                  setCustomAmount(e.target.value);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">RON</span>
            </div>
          </div>

          {/* Secure / Transparency Notice */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tranzacții 100% Sigure</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  Plățile sunt procesate în totalitate pe platformele oficiale Revolut și PayPal. Informațiile dumneavoastră financiare nu ajung niciodată pe serverele noastre.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Impactul tău direct</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  Banii colectați sunt redirecționați exclusiv pentru plata abonamentelor de server în cloud (Cloud Run, Firebase Firestore), script-ului de scraping de ghiduri, și îmbunătățirea calității streamingului video integrat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Target Platforms */}
        <div className="md:col-span-5 space-y-4">
          {/* Revolut Row */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl border border-zinc-800 bg-[#0075eb]/5 text-zinc-100 flex flex-col justify-between transition-all group overflow-hidden relative"
          >
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#0075eb]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0075eb]/15 flex items-center justify-center font-black text-lg text-[#0075eb]">R</div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Revolut Me</h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Plată rapidă direct din aplicație</p>
                </div>
              </div>
              <span className="text-[10px] bg-[#0075eb]/20 text-[#0075eb] font-bold px-2 py-1 rounded">RECOMANDAT</span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Utilizează link-ul securizat Revolut Me pentru a doneze direct și simplu, fie cu cardul bancar sau direct din contul de Revolut.
            </p>

            <div className="space-y-2.5">
              <a 
                href={getActiveLink(revolutLink)}
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#0075eb] hover:bg-[#1a85f5] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#0075eb]/15"
              >
                <span>Donează via Revolut</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleCopy(revolutLink, 'revolut')}
                className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white py-2.5 rounded-xl font-semibold text-xs border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {copiedText === 'revolut' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold">Link Copiat în Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiază Link-ul Revolut</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* PayPal Row */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl border border-zinc-800 bg-[#003087]/5 text-zinc-100 flex flex-col justify-between transition-all group overflow-hidden relative"
          >
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#003087]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#003087]/15 flex items-center justify-center font-black text-lg text-[#003087]">P</div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">PayPal</h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Plată sigură internațională</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Plătește prin rețeaua internațională PayPal. Suportă donații recurente sau unice cu cardul de credit/debit sau contul de PayPal.
            </p>

            <div className="space-y-2.5">
              <a 
                href={getActiveLink(paypalLink)}
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#003087] hover:bg-[#0045c7] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#003087]/15"
              >
                <span>Donează via PayPal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleCopy(paypalLink, 'paypal')}
                className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white py-2.5 rounded-xl font-semibold text-xs border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {copiedText === 'paypal' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold">Link Copiat în Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiază Link-ul PayPal</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
