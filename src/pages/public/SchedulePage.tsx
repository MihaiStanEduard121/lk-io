import { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { TVScheduleItem } from '../../types';
import { Calendar as CalendarIcon, Clock, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<TVScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getSchedule().then(data => {
      const sorted = data.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      setSchedule(sorted);
      setLoading(false);
    });
  }, []);

  const { filteredSchedule, channels, dates } = useMemo(() => {
    let filtered = schedule;
    
    // Extrage canale unice si date unice pentru filtre
    const uniqChannels = Array.from(new Set(schedule.map(s => s.channelId || ''))).filter(Boolean);
    const uniqDates = Array.from(new Set(schedule.map(s => s.date))).filter(Boolean);
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q)
      );
    }
    
    if (selectedChannel) {
      filtered = filtered.filter(s => s.channelId === selectedChannel);
    }
    
    if (selectedDate) {
      filtered = filtered.filter(s => s.date === selectedDate);
    }
    
    return { filteredSchedule: filtered, channels: uniqChannels, dates: uniqDates };
  }, [schedule, search, selectedChannel, selectedDate]);

  if (loading) return <div className="h-screen flex items-center justify-center text-zinc-500">Încărcare...</div>;

  const grouped = filteredSchedule.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, TVScheduleItem[]>);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-bold text-white tracking-tight">Program TV</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
             <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"/>
             <input 
               type="text" 
               placeholder="Caută emisiune..."
               className="w-full sm:w-48 pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <div className="relative">
             <Filter className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"/>
             <select 
               className="w-full sm:w-40 pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
               value={selectedChannel}
               onChange={(e) => setSelectedChannel(e.target.value)}
             >
               <option value="">Toate canalele</option>
               {channels.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
          <div className="relative">
             <CalendarIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"/>
             <select 
               className="w-full sm:w-40 pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
             >
               <option value="">Toate zilele</option>
               {dates.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-zinc-500 text-center py-12">Nu s-a găsit niciun program pentru filtrele selectate.</div>
      ) : (
        <div className="space-y-12">
          {Object.keys(grouped).map((date, idx) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={date}>
              <h2 className="text-2xl font-bold text-indigo-400 mb-6 border-b border-zinc-800 pb-3">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              <div className="space-y-4">
                {grouped[date].map(item => (
                  <div key={item.id} className="flex gap-4 md:gap-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-6 hover:bg-zinc-800/80 transition-colors">
                    <div className="flex flex-col items-center justify-center w-16 md:w-24 flex-shrink-0 border-r border-zinc-800 pr-4 md:pr-6">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-zinc-500 mb-1 md:mb-2" />
                      <span className="font-mono text-lg md:text-xl font-bold text-white">{item.time}</span>
                    </div>
                    <div>
                      {item.channelId && <span className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs rounded mb-2 font-medium">{item.channelId}</span>}
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{item.title}</h3>
                      {item.description && <p className="text-sm md:text-base text-zinc-400 line-clamp-3">{item.description}</p>}
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
