import React, { useState, useEffect } from 'react';
import { Download, Check, Sparkles } from 'lucide-react';

export default function PwaInstallButton({ className = '' }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If prompt not available, show helpful modal/toast
      alert('Pentru a instala aplicația:\n- Pe Android/Chrome: Deschide meniul ⋮ și alege „Instalează aplicația” sau „Adaugă pe ecranul principal”.\n- Pe iOS/Safari: Apasă pe butonul Share (Pătratul cu săgeată) și selectează „Add to Home Screen”.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      title="Instalează aplicația pe ecranul principal"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
        deferredPrompt
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs animate-pulse'
          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
      } ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      <span>Instalează Aplicația</span>
    </button>
  );
}
