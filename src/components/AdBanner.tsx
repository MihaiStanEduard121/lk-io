import { useEffect, useRef } from 'react';

interface AdBannerProps {
  zoneId?: string;
  format?: 'leaderboard' | 'box' | 'horizontal';
  className?: string;
}

export default function AdBanner({
  zoneId = '11835805',
  format = 'horizontal',
  className = '',
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject the Monetag banner script into the container if not already initialized
    try {
      if (containerRef.current) {
        const existingScript = containerRef.current.querySelector(`script[data-zone="${zoneId}"]`);
        if (!existingScript) {
          const s = document.createElement('script');
          s.dataset.zone = zoneId;
          s.src = 'https://nap5k.com/tag.min.js';
          s.async = true;
          containerRef.current.appendChild(s);
        }
      }
    } catch (e) {
      console.warn('AdBanner injection error:', e);
    }
  }, [zoneId]);

  return (
    <div
      id={`ad-zone-${zoneId}`}
      className={`relative mx-auto my-4 w-full text-center overflow-hidden transition-all ${className}`}
    >
      <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1">
        Publicitate
      </div>
      <div
        ref={containerRef}
        data-zone={zoneId}
        className={`w-full min-h-[90px] flex items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-2 ${
          format === 'leaderboard'
            ? 'max-w-4xl min-h-[90px]'
            : format === 'box'
            ? 'max-w-xs min-h-[250px]'
            : 'max-w-3xl min-h-[100px]'
        }`}
      >
        {/* Placeholder label when ads are loading or adblock is disabled */}
        <div className="text-xs text-zinc-400 dark:text-zinc-600 font-medium select-none pointer-events-none">
          Spațiu Publicitar • Zonă {zoneId}
        </div>
      </div>
    </div>
  );
}
