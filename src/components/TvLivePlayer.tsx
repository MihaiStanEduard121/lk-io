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
  Server, 
  ExternalLink, 
  AlertTriangle,
  Radio,
  Tv,
  Layers
} from 'lucide-react';

interface TvLivePlayerProps {
  streamUrl?: string;
  embedCode?: string;
  title: string;
  thumbnail?: string;
  isDark?: boolean;
}

export function cleanAndSanitizeIframe(rawHtml: string): string {
  if (!rawHtml) return '';
  let clean = rawHtml.trim();

  // If raw URL, wrap in iframe or video
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

export default function TvLivePlayer({ streamUrl, embedCode, title, thumbnail, isDark = true }: TvLivePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Determine available sources
  const hasDirectStream = !!streamUrl && streamUrl.trim().length > 0;
  
  // Extract iframe src if present
  const rawEmbed = embedCode?.trim() || '';
  const iframeSrcMatch = rawEmbed.match(/src=["']([^"']+)["']/i);
  const embedIframeSrc = iframeSrcMatch ? iframeSrcMatch[1] : '';
  const isEmbedM3u8 = embedIframeSrc.includes('.m3u8') || rawEmbed.includes('.m3u8');
  
  // Real valid embed code that is not just an m3u8 wrapped in an iframe
  const hasHtmlEmbed = !isEmbedM3u8 && rawEmbed.length > 0 && !rawEmbed.includes('canale-tv.net');

  // Server modes:
  // 1: Direct CDN HLS
  // 2: HTTPS Proxy Stream (bypasses CORS & mixed content)
  // 3: HTML Embed / External Player
  type ServerType = 1 | 2 | 3;
  const [activeServer, setActiveServer] = useState<ServerType>(() => {
    if (hasDirectStream) return 1;
    if (hasHtmlEmbed) return 3;
    return 2;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const controlsTimeoutRef = useRef<any>(null);

  // Compute the exact stream URL for the active server
  const effectiveStreamUrl = useMemo(() => {
    let base = streamUrl || (isEmbedM3u8 ? embedIframeSrc : '');
    if (!base) return '';

    if (activeServer === 2) {
      // Proxy through our backend
      return `/api/media/stream-proxy?url=${encodeURIComponent(base)}`;
    }
    return base;
  }, [streamUrl, isEmbedM3u8, embedIframeSrc, activeServer]);

  // HLS stream loader & error handler
  useEffect(() => {
    if (activeServer === 3) {
      // In embed mode, Hls is not needed
      setIsLoading(false);
      setErrorState(null);
      return;
    }

    const video = videoRef.current;
    if (!video || !effectiveStreamUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorState(null);

    // Destroy existing Hls instance
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
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 1000,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
      });

      hlsRef.current = hls;
      hls.loadSource(effectiveStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setErrorState(null);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          // Autoplay policy might require mute
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn('[TvPlayer] Fatal HLS error:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // If Server 1 failed with network/CORS error, auto-fallback to Server 2 (Secure Proxy)
              if (activeServer === 1) {
                console.info('[TvPlayer] Switching to Server 2 (Secure Proxy) fallback...');
                setActiveServer(2);
              } else {
                hls.startLoad();
                setErrorState('Reîncărcare flux transmisiune...');
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setErrorState('Fluxul este momentan indisponibil pe acest server.');
              break;
          }
        }
      });
    } else if (canPlayHlsNative) {
      // Safari iOS native HLS
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
        if (activeServer === 1) {
          setActiveServer(2);
        } else {
          setErrorState('Transmisiunea nu a putut fi pornită pe acest dispozitiv.');
        }
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
  }, [effectiveStreamUrl, activeServer, retryCount]);

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Handle Mute/Unmute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Volume change
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
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Refresh stream
  const handleReload = () => {
    setIsLoading(true);
    setErrorState(null);
    setRetryCount(prev => prev + 1);
  };

  // Handle user activity to show/hide controls
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
      className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative bg-black select-none group border border-zinc-800/80"
    >
      {/* Top Bar: Channel Badge & Server Switcher */}
      <div className={`absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold tracking-wider uppercase shadow-md shadow-red-950/40">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md text-zinc-300 text-xs font-medium border border-zinc-700/50">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>HD 1080p</span>
          </div>
          <span className="text-white text-sm sm:text-base font-bold drop-shadow-md truncate max-w-[200px] sm:max-w-xs">
            {title}
          </span>
        </div>

        {/* Server Selector Bar */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-zinc-800/80 text-xs">
          <button
            id="btn-server-1"
            onClick={() => { setActiveServer(1); setErrorState(null); }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              activeServer === 1 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            title="Server 1: Flux Direct CDN de mare viteză"
          >
            <Server className="w-3 h-3" />
            <span>Server 1</span>
          </button>

          <button
            id="btn-server-2"
            onClick={() => { setActiveServer(2); setErrorState(null); }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              activeServer === 2 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            title="Server 2: Conexiune HTTPS Securizată fără blocaje"
          >
            <Server className="w-3 h-3" />
            <span>Server 2 (Securizat)</span>
          </button>

          {hasHtmlEmbed && (
            <button
              id="btn-server-3"
              onClick={() => { setActiveServer(3); setErrorState(null); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeServer === 3 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
              title="Server 3: Player Oficial Embed"
            >
              <Layers className="w-3 h-3" />
              <span>Server 3 (Embed)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Video Element (for Server 1 & 2) */}
      {activeServer !== 3 && (
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

      {/* Embedded Iframe Player (for Server 3) */}
      {activeServer === 3 && hasHtmlEmbed && (
        <div 
          id="tv-iframe-wrapper"
          className="w-full h-full relative"
          dangerouslySetInnerHTML={{ __html: cleanAndSanitizeIframe(rawEmbed) }}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white">
          <div className="relative flex items-center justify-center mb-3">
            <div className="w-14 h-14 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            {thumbnail ? (
              <img 
                src={thumbnail} 
                alt="" 
                className="w-8 h-8 rounded-full object-contain absolute opacity-80"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <Tv className="w-6 h-6 text-indigo-400 absolute" />
            )}
          </div>
          <p className="text-sm font-medium text-zinc-300">Conectare la fluxul live...</p>
        </div>
      )}

      {/* Error Fallback Banner */}
      {errorState && !isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            Transmisia a întâmpinat o problemă
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            {errorState} Puteți încerca să reîncărcați sau să comutați pe un server alternativ mai rapid.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              id="btn-retry-player"
              onClick={handleReload}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Reîncearcă Fluxul
            </button>
            {activeServer !== 2 && (
              <button
                id="btn-switch-server-2"
                onClick={() => { setActiveServer(2); setErrorState(null); }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Server className="w-3.5 h-3.5" />
                Comută pe Server 2 (Securizat)
              </button>
            )}
            {streamUrl && (
              <a
                id="link-open-external-stream"
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Deschide în player extern
              </a>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar (Custom for HLS) */}
      {activeServer !== 3 && (
        <div className={`absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Left: Play/Pause, Volume */}
          <div className="flex items-center gap-3">
            <button
              id="btn-play-pause"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              title={isPlaying ? 'Pauză' : 'Redare'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
            </button>

            <button
              id="btn-toggle-mute"
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              title={isMuted ? 'Activează sunetul' : 'Oprește sunetul'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center w-20">
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
          </div>

          {/* Right: Reload & Fullscreen */}
          <div className="flex items-center gap-2">
            <button
              id="btn-reload-stream"
              onClick={handleReload}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              title="Reîmprospătează transmisia"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              id="btn-fullscreen"
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              title={isFullscreen ? 'Ieși din ecran complet' : 'Ecran complet'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
