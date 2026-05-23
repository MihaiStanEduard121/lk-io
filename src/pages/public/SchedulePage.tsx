import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { TVScheduleItem } from '../../types';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<TVScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getSchedule().then(data => {
      // Sort by date then time
      const sorted = data.sort((a: any, b: any) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      setSchedule(sorted);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;

  // Group by date
  const grouped = schedule.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, TVScheduleItem[]>);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 min-h-screen">
      <div className="flex items-center space-x-3 mb-10">
        <CalendarIcon className="w-8 h-8 text-indigo-500" />
        <h1 className="text-4xl font-bold text-white tracking-tight">Program TV</h1>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-zinc-500 text-center py-12">Nu există program disponibil în acest moment.</div>
      ) : (
        <div className="space-y-12">
          {Object.keys(grouped).map((date, idx) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={date}>
              <h2 className="text-2xl font-bold text-indigo-400 mb-6 border-b border-zinc-800 pb-3">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              <div className="space-y-4">
                {grouped[date].map(item => (
                  <div key={item.id} className="flex gap-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/80 transition-colors">
                    <div className="flex flex-col items-center justify-center w-24 flex-shrink-0 border-r border-zinc-800 pr-6">
                      <Clock className="w-5 h-5 text-zinc-500 mb-2" />
                      <span className="font-mono text-xl font-bold text-white">{item.time}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-zinc-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
