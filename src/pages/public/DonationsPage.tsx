import React, { useState } from 'react';
import { useAppLanguage } from '../../context/LanguageContext';
import { Heart, ShieldCheck, Zap, Copy, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import DonationSuccessModal from '../../components/DonationSuccessModal';

export default function DonationsPage() {
  const { translateUI } = useAppLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const revolutLink = "https://revolut.me/revutza";
  const paypalLink = "https://www.paypal.me/MihaiUtzz";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getPaypalLink = (baseUrl: string) => {
    const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : null);
    if (amount && !isNaN(amount) && amount > 0) {
      return `${baseUrl}/${amount}RON`;
    }
    return baseUrl;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Enhanced Hero Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 text-rose-300 px-4 py-1.5 rounded-full border border-rose-500/20 text-xs font-black uppercase tracking-widest mb-6"
          >
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
            <span>Susține comunitatea</span>
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-white mb-8">
            Fii parte din<br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400 drop-shadow-2xl">evoluția noastră</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            programetv.online trăiește prin voi. Donația ta acoperă costurile de server și ne permite să adăugăm funcționalități unice, rămânând 100% independenți și fără reclame invazive.
          </p>
        </div>

        <DonationSuccessModal 
          isOpen={showSuccess} 
          onClose={() => setShowSuccess(false)} 
          amount={selectedAmount?.toString() || customAmount || '0'} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Donation Interaction */}
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Zap className="w-6 h-6 text-amber-400 mr-3" />
                Alege contribuția (în LEI / RON)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                    className={`py-5 rounded-2xl text-xl font-black border-2 transition-all duration-300 ${
                      selectedAmount === amt
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-xl shadow-indigo-900/40 scale-105'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {amt}
                    <div className="text-[10px] font-bold opacity-60">RON</div>
                  </button>
                ))}
              </div>

              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5"/>
                <input
                  type="number"
                  placeholder="Altă sumă (RON)..."
                  value={customAmount}
                  onChange={(e) => { setSelectedAmount(null); setCustomAmount(e.target.value); }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-12 py-5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all font-black text-lg"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[ {icon: ShieldCheck, title: 'Tranzacții criptate', desc: 'Sisteme securizate.'},
                 {icon: TrendingUp, title: 'Sustinere directă', desc: 'Fără intermediari.'}].map((item, i) => (
                <div key={i} className="bg-zinc-900/30 p-6 rounded-3xl border border-zinc-850 flex items-start space-x-4">
                  <div className="p-3 bg-zinc-800 rounded-2xl"><item.icon className="w-6 h-6 text-indigo-400" /></div>
                  <div>
                    <h4 className="font-bold text-white text-base">{item.title}</h4>
                    <p className="text-sm text-zinc-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods - Elevated Cards */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-2">Alege metoda</h3>
            
            {[ {name: 'Revolut', link: revolutLink, color: '#0075eb', desc: 'Rapid & Direct'},
               {name: 'PayPal', link: paypalLink, color: '#003087', desc: 'Plată securizată (RON)'} ].map((method) => {
              const activeLink = method.name === 'PayPal' ? getPaypalLink(method.link) : method.link;
              return (
                <motion.div 
                  key={method.name} 
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/30"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div style={{backgroundColor: `${method.color}20`, color: method.color}} className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0">
                        {method.name[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-white text-xl whitespace-nowrap leading-tight">{method.name}</h4>
                        <p className="text-sm text-zinc-500 font-bold leading-tight mt-1">{method.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <a 
                      href={activeLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full bg-white text-black py-5 rounded-2xl font-black text-base flex items-center justify-center space-x-2 hover:bg-zinc-200 transition-all shadow-lg hover:shadow-white/10"
                    >
                      <span>Donează Acum {method.name === 'PayPal' && (selectedAmount || customAmount) ? `(${selectedAmount || customAmount} RON)` : ''}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => handleCopy(activeLink, method.name)} 
                      className="w-full border-2 border-zinc-800 text-zinc-400 py-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                      {copiedText === method.name ? <span className="text-emerald-400">Link copiat!</span> : <> <Copy className="w-4 h-4"/> <span>Copiază Link-ul ({method.name})</span> </>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <button 
                onClick={() => setShowSuccess(true)}
                className="mt-8 text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
          >
            Simulează Succes (Test)
          </button>
        </div>
      </div>
    </div>
  );
}
