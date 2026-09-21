import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Radio,
  Tv,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface TvLivePlayerProps {
  streamUrl?: string;
  backupStreamUrl?: string;
  embedCode?: string;
  title: string;
  thumbnail?: string;
  isDark?: boolean;
}

export function cleanAndSanitizeIframe(rawHtml: string): string {
  if (!rawHtml) return '';
  let clean = rawHtml.trim();

  // If raw URL, wrap in iframe
  if (/^https?:\/\/[^\s<>\"]+$/i.test(clean)) {
    if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
      const match = clean.match(/(?:v=|v\/|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        return `<iframe src="https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>`;
      }
    }
    return `<iframe src="${clean}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="no-referrer" style="width:100%;height:100%;border:none;"></iframe>`;
  }

  // Sanitize existing iframe
  clean = clean.replace(/src="http:\/\//gi, 'src="https://');
  clean = clean.replace(/width="[^"]*"/gi, 'width="100%"');
  clean = clean.replace(/height="[^"]*"/gi, 'height="100%"');
  clean = clean.replace(/referrerpolicy="[^"]*"/gi, 'referrerpolicy="no-referrer"');

  const allowAttrs = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  if (!clean.includes('allow=')) {
    clean = clean.replace(/<iframe/gi, `<iframe allow="${allowAttrs}"`);
  }
  if (!clean.includes('allowfullscreen')) {
    clean = clean.replace(/<iframe/gi, '<iframe allowfullscreen="true"');
  }
  if (!clean.includes('referrerpolicy')) {
    clean = clean.replace(/<iframe/gi, '<iframe referrerpolicy="no-referrer"');
  }

  return clean;
}

export default function TvLivePlayer({ 
  streamUrl, 
  backupStreamUrl,
  embedCode, 
  title, 
  thumbnail, 
  isDark = true 
}: TvLivePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const primaryStream = (streamUrl || '').trim();
  const secondaryStream = (backupStreamUrl || '').trim();
  
  const rawEmbed = (embedCode || '').trim();
  const iframeSrcMatch = rawEmbed.match(/src=["']([^"']+)["']/i);
  const embedIframeSrc = iframeSrcMatch ? iframeSrcMatch[1] : '';
  const isEmbedM3u8 = embedIframeSrc.includes('.m3u8') || rawEmbed.includes('.m3u8');
  const hasHtmlEmbed = !isEmbedM3u8 && rawEmbed.length > 0;

  // Stream stage auto-progression:
  // 0: Primary Direct Stream
  // 1: Primary Stream via Secure HTTPS Proxy
  // 2: Backup Direct Stream
  // 3: Backup Stream via Proxy
  // 4: HTML Embed (if available)
  const [streamStage, setStreamStage] = useState<number>(() => {
    if (primaryStream) {
      // If starts with http://, go directly to secure proxy to avoid browser Mixed Content blocks
      if (primaryStream.startsWith('http://')) return 1;
      return 0;
    }
    if (secondaryStream) {
      if (secondaryStream.startsWith('http://')) return 3;
      return 2;
    }
    if (hasHtmlEmbed) return 4;
    return 1;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [retryNonce, setRetryNonce] = useState<number>(0);
  const controlsTimeoutRef = useRef<any>(null);

  // Compute active target stream URL based on stage
  const effectiveStreamUrl = useMemo(() => {
    if (streamStage === 0 && primaryStream) {
      return primaryStream;
    }
    if (streamStage === 1 && primaryStream) {
      return `/api/media/stream-proxy?url=${encodeURIComponent(primaryStream)}`;
    }
    if (streamStage === 2 && secondaryStream) {
      return secondaryStream;
    }
    if (streamStage === 3 && secondaryStream) {
      return `/api/media/stream-proxy?url=${encodeURIComponent(secondaryStream)}`;
    }
    if (streamStage === 4 && !hasHtmlEmbed && primaryStream) {
      // Final fallback to proxied primary
      return `/api/media/stream-proxy?url=${encodeURIComponent(primaryStream)}`;
    }
    return primaryStream ? `/api/media/stream-proxy?url=${encodeURIComponent(primaryStream)}` : '';
  }, [streamStage, primaryStream, secondaryStream, hasHtmlEmbed]);

  // Handle stage failure / auto fallback seamlessly
  const advanceToNextFallback = useCallback(() => {
    setStreamStage((prev) => {
      if (prev === 0) return 1; // Try proxied
      if (prev === 1) {
        if (secondaryStream && secondaryStream !== primaryStream) return 2; // Try backup direct
        if (hasHtmlEmbed) return 4; // Try web embed
        return 1; // Stay on proxy with reload
      }
      if (prev === 2) return 3; // Try backup proxied
      if (prev === 3) {
        if (hasHtmlEmbed) return 4;
        return 1;
      }
      return prev;
    });
  }, [primaryStream, secondaryStream, hasHtmlEmbed]);

  // Main HLS Stream Loader
  useEffect(() => {
    if (streamStage === 4 && hasHtmlEmbed) {
      setIsLoading(false);
      setErrorState(null);
      return;
    }

    const video = videoRef.current;
    if (!video || !effectiveStreamUrl) {
      setIsLoading(false);
      if (!primaryStream && !secondaryStream && !hasHtmlEmbed) {
        setErrorState('Fluxul transmisiunii este momentan în curs de sincronizare.');
      }
      return;
    }

    setIsLoading(true);
    setErrorState(null);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const canPlayHlsNative = video.canPlayType('application/vnd.apple.mpegurl');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 300,
        maxBufferSize: 30 * 1000 * 1000,
        maxBufferHole: 0.5,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 800,
        fragLoadingTimeOut: 15000,
        fragLoadingMaxRetry: 5,
        fragLoadingRetryDelay: 800,
      });

      hlsRef.current = hls;
      hls.loadSource(effectiveStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setErrorState(null);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          // Handle browser autoplay policy by auto-muting
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn('[TvPlayer] HLS fatal error on stage', streamStage, data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Intelligent auto-recovery
              advanceToNextFallback();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              advanceToNextFallback();
              break;
          }
        }
      });
    } else if (canPlayHlsNative) {
      // Safari / iOS WebKit native playback
      video.src = effectiveStreamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setErrorState(null);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      });
      video.addEventListener('error', () => {
        advanceToNextFallback();
      });
    } else {
      setErrorState('Browserul dumneavoastră nu suportă redarea fluxurilor HLS.');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [effectiveStreamUrl, streamStage, retryNonce, primaryStream, secondaryStream, hasHtmlEmbed, advanceToNextFallback]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted]);

  // Volume slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    const video = videoRef.current;
    if (video) {
      video.volume = newVol;
      video.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Reload / Reconnect stream
  const handleReload = () => {
    setIsLoading(true);
    setErrorState(null);
    setStreamStage(primaryStream && primaryStream.startsWith('http://') ? 1 : 0);
    setRetryNonce(prev => prev + 1);
  };

  // Keyboard shortcuts (Space, M, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  // Mouse move control visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  return (
    <div 
      ref={containerRef}
      id="tv-live-player-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative bg-black select-none group border border-zinc-800"
    >
      {/* Top Bar: Channel Header & Live Badge */}
      <div className={`absolute top-0 inset-x-0 z-30 p-3 sm:p-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-red-950/50">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-zinc-700/60 shadow-sm">
            <Radio className="w-3.5 h-3.5" />
            <span>1080p HD</span>
          </div>
          <span className="text-white text-sm sm:text-base font-bold drop-shadow-md truncate max-w-[200px] sm:max-w-md">
            {title}
          </span>
        </div>

        {/* Quick Reconnect Action */}
        <button
          id="btn-quick-reload"
          onClick={handleReload}
          className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all border border-zinc-700/60 shadow-sm flex items-center gap-1.5 text-xs font-medium"
          title="Reîmprospătează transmisiunea"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reconectează</span>
        </button>
      </div>

      {/* Main Video Element */}
      {!(streamStage === 4 && hasHtmlEmbed) && (
        <video
          ref={videoRef}
          id="tv-video-element"
          className="w-full h-full object-contain cursor-pointer"
          playsInline
          autoPlay
          onClick={togglePlay}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => { setIsLoading(false); setErrorState(null); }}
        />
      )}

      {/* HTML Embed Player (if active) */}
      {streamStage === 4 && hasHtmlEmbed && (
        <div 
          id="tv-iframe-wrapper"
          className="w-full h-full relative bg-black flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: cleanAndSanitizeIframe(rawEmbed) }}
        />
      )}

      {/* Loading Spinner with Channel Logo */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs text-white">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            {thumbnail ? (
              <img 
                src={thumbnail} 
                alt="" 
                className="w-9 h-9 rounded-full object-contain absolute opacity-90 shadow-sm"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <Tv className="w-7 h-7 text-indigo-400 absolute" />
            )}
          </div>
          <p className="text-sm font-semibold text-zinc-200">Se încarcă {title}...</p>
          <span className="text-xs text-zinc-400 mt-1">Conectare la serverul de streaming</span>
        </div>
      )}

      {/* Error Fallback */}
      {errorState && !isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white mb-1">
            Transmisia {title} întâmpină dificultăți
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-5">
            Fluxul nu a răspuns la conexiunea directă. Apăsați butonul de mai jos pentru a reîncerca prin conexiunea securizată.
          </p>
          <div className="flex items-center gap-3">
            <button
              id="btn-reconnect-stream"
              onClick={handleReload}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
              Reîncearcă Transmisiunea
            </button>
            {effectiveStreamUrl && (
              <a
                id="link-external-source"
                href={effectiveStreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Deschide sursa
              </a>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      {!(streamStage === 4 && hasHtmlEmbed) && (
        <div className={`absolute bottom-0 inset-x-0 z-30 p-3 sm:p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Left: Play/Pause, Volume */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              id="btn-play-pause"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
              title={isPlaying ? 'Pauză (Spațiu)' : 'Redare (Spațiu)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
            </button>

            <button
              id="btn-toggle-mute"
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
              title={isMuted ? 'Activează sunetul (M)' : 'Oprește sunetul (M)'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center w-24">
              <input
                id="input-player-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full accent-indigo-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                title="Volum"
              />
            </div>

            <div className="flex items-center gap-2 pl-2 text-xs text-zinc-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>În direct</span>
            </div>
          </div>

          {/* Right: Reconnect & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-bottom-reload"
              onClick={handleReload}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
              title="Reîmprospătează transmisiunea"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              id="btn-fullscreen"
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
              title={isFullscreen ? 'Ieși din ecran complet (F)' : 'Ecran complet (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
