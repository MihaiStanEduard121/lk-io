import React from 'react';
import { Bell, Play, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TVReminder } from '../lib/useReminders';

interface ReminderNotificationModalProps {
  alert: TVReminder | null;
  onClose: () => void;
  isDark?: boolean;
}

export default function ReminderNotificationModal({ alert, onClose, isDark }: ReminderNotificationModalProps) {
  if (!alert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`p-5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
        isDark 
          ? 'bg-zinc-900/95 border-indigo-500/40 text-white' 
          : 'bg-white/95 border-indigo-200 text-slate-900'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-500">
                Reminder Emisiune TV
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {alert.showTitle}
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4 font-medium">
          Emisiunea începe la ora <strong className="text-slate-900 dark:text-white font-mono">{alert.startTime}</strong> pe canalul <strong>{alert.channelTitle}</strong>.
        </p>

        <div className="flex items-center gap-2">
          <Link
            to={`/ro/play/${alert.channelId}`}
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Deschide Canalul Live</span>
          </Link>
          <button
            onClick={onClose}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
