import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, Facebook, Twitter, Mail, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
}

export default function DonationSuccessModal({ isOpen, onClose, amount }: Props) {
  const shareText = `Tocmai am susținut programetv.online cu o donație de ${amount} RON pentru servere și mentenanță! Hai și tu!`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=Susține programetv.online&body=${encodeURIComponent(shareText)}`
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-zinc-900 border border-zinc-700 p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Mulțumim din suflet!</h2>
              <p className="text-zinc-400 mb-8">
                Donația ta de <span className="text-white font-black">{amount} RON</span> ne ajută să rămânem independenți și să creștem calitatea serviciului.
              </p>

              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ai putea să ne ajuți cu un share?</p>
                <div className="flex justify-center space-x-4">
                  {[
                    { icon: Facebook, href: shareLinks.facebook, label: 'Facebook' },
                    { icon: Twitter, href: shareLinks.twitter, label: 'Twitter' },
                    { icon: Mail, href: shareLinks.email, label: 'Email' }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
                      aria-label={`Share on ${social.label}`}
                    >
                      <social.icon className="w-5 h-5 text-white" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
