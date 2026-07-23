import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, MapPin, Tv, Volume2, ShieldAlert, 
  ExternalLink, MessageCircle, Send, Award, Users, RefreshCw
} from 'lucide-react';
import { WCMatch, TEAM_FLAGS, getMatchLiveStatus, getActiveTime } from './worldCupData';
import { enhanceEmbedCode } from './PlayerPage';
import { db, handleFirestoreError } from '../../lib/firebase';
import { api } from '../../lib/api';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, doc, serverTimestamp } from 'firebase/firestore';
import { getCalculatedLiveViewers, formatViewerCount } from '../../lib/viewerUtils';

export default function WorldCupMatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState<WCMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isLive: false });
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [activeTab, setActiveTab ] = useState<'stream' | 'stats' | 'lineups' | 'replay'>('stream');
  
  // Custom Player Config States
  const [activePlayerSource, setActivePlayerSource] = useState<'player1' | 'player2' | 'player3'>('player1');
  const [playerConfig, setPlayerConfig] = useState<any>({
    player1Active: true,
    player1Embed: '',
    player2Active: false,
    player2Embed: '',
    player3Active: false,
    player3Embed: ''
  });

  // Dynamic real-time loading of player configurations from Firestore
  useEffect(() => {
    if (!id) return;
    api.getWorldCupMatch(id).then(data => {
      setMatch(data as WCMatch);
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !match) return;
    const docRef = doc(db, 'match_players', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlayerConfig(docSnap.data());
      } else {
        // Fallback to static match data if no admin custom config exists yet
        setPlayerConfig({
          player1Active: true,
          player1Embed: match.embedCode || '',
          player2Active: false,
          player2Embed: '',
          player3Active: false,
          player3Embed: ''
        });
      }
    }, (error) => {
      handleFirestoreError(error, 'get' as any, `match_players/${id}`);
    });

    return () => unsubscribe();
  }, [id, match]);

  // Storage for simulator state updates
  const [simulationActive, setSimulationActive] = useState(localStorage.getItem('wc_simulation_active') === 'true');
  const [liveViewers, setLiveViewers] = useState<number>(1);
  
  // Live polls
  const [votes, setVotes] = useState({ team1: 45, draw: 15, team2: 40 });
  const [voted, setVoted] = useState(false);

  // References for scrolling & chat containing
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync simulation checkboxes if modified on other screens
  useEffect(() => {
    const handleSync = () => {
      setSimulationActive(localStorage.getItem('wc_simulation_active') === 'true');
    };
    window.addEventListener('wc_sim_change', handleSync);
    return () => window.removeEventListener('wc_sim_change', handleSync);
  }, []);

  // Poll server statistical metrics to display accurate user counts
  useEffect(() => {
    const fetchLiveCount = async () => {
      try {
        const viewsMap = await api.getWorldCupMatchViews();
        const exact = viewsMap[`/world-cup/${id}`] || 0;
        setLiveViewers(exact);
      } catch (err) {
        console.warn('Could not fetch active viewers list', err);
      }
    };

    fetchLiveCount();
  }, [id, simulationActive]);

  // Locate current match
  // Removed static logic - now handled by fetch

  useEffect(() => {
    const timer = setTimeout(() => {
      const win = window as any;
      if (win.Plyr) {
        win.Plyr.setup('.plyr-video', {
          autoplay: false,
          controls: [
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'fullscreen'
          ],
          playsinline: true,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeTab, activePlayerSource, playerConfig]);

  // Handle countdown calculation
  useEffect(() => {
    if (!match) return;

    const interval = setInterval(() => {
      const matchTime = new Date(match.datetime).getTime();
      const now = getActiveTime();
      const diff = matchTime - now;

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0, isLive: true });
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours, minutes, seconds, isLive: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match, simulationActive]);

  // Compute live match stats and scoreboard info
  const liveState = useMemo(() => {
    if (!match) return { status: 'scheduled' as const, score1: 0, score2: 0, isPast: false };
    return getMatchLiveStatus(match, getActiveTime());
  }, [match, simulationActive]);

  // Real-time Firestore chat listener to download & display actual fan messages
  useEffect(() => {
    if (!id || !match) return;

    const q = query(
      collection(db, 'world_cup_chats'),
      where('matchId', '==', id),
      orderBy('createdAt', 'asc'),
      limit(60)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            user: data.user || 'Anonymous',
            text: data.text || '',
            time: data.time || '12:00',
            team: data.team || 'neutral',
            createdAt: data.createdAt
          };
        });
        setChatMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'world_cup_chats');
    });

    return () => unsubscribe();
  }, [id, match]);

  // Scroll only the chat container to bottom, completely avoiding viewport page scroll-jumps
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !match || !id) return;

    // Use name from localStorage or generate a friendly random persistent suporter nickname
    let nickname = localStorage.getItem('chat_nickname');
    if (!nickname) {
      nickname = 'Supporter';
      localStorage.setItem('chat_nickname', nickname);
    }

    try {
      await addDoc(collection(db, 'world_cup_chats'), {
        matchId: id,
        user: nickname,
        text: newMsg.trim(),
        time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        createdAt: serverTimestamp(),
        team: 'neutral'
      });
      setNewMsg('');
    } catch (err) {
      console.error('Error saving comment in Firestore: ', err);
    }
  };

  const handleVote = (option: 'team1' | 'draw' | 'team2') => {
    if (voted) return;
    setVotes(prev => {
      const updated = { ...prev };
      updated[option] = updated[option] + 1;
      return updated;
    });
    setVoted(true);
  };

  const votePercentages = useMemo(() => {
    const total = votes.team1 + votes.draw + votes.team2;
    return {
      team1: Math.round((votes.team1 / total) * 100),
      draw: Math.round((votes.draw / total) * 100),
      team2: Math.round((votes.team2 / total) * 100),
    };
  }, [votes]);

  const currentEmbedCode = useMemo(() => {
    return activePlayerSource === 'player1'
      ? (playerConfig?.player1Embed || match?.embedCode || '')
      : activePlayerSource === 'player2'
        ? (playerConfig?.player2Embed || '')
        : (playerConfig?.player3Embed || '');
  }, [activePlayerSource, playerConfig, match]);

  const isCurrentActive = useMemo(() => {
    return activePlayerSource === 'player1'
      ? (playerConfig ? playerConfig.player1Active : true)
      : activePlayerSource === 'player2'
        ? (playerConfig ? playerConfig.player2Active : false)
        : (playerConfig ? playerConfig.player3Active : false);
  }, [activePlayerSource, playerConfig]);

  // Upcoming matches for the horizontal top ribbon
  const [upcomingMatches, setUpcomingMatches] = useState<WCMatch[]>([]);
  useEffect(() => {
    api.getWorldCupMatches().then(data => {
      if(id && data) {
         setUpcomingMatches(data.filter((m: any) => m.id !== id).slice(0, 5));
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-zinc-400">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-zinc-400">Loading match details...</p>
          <Link to="/world-cup" className="mt-4 inline-flex items-center space-x-2 text-amber-500 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to World Cup</span>
          </Link>
        </div>
      </div>
    );
  }

  const flag1 = `https://flagcdn.com/w160/${match.team1Code}.png`;
  const flag2 = `https://flagcdn.com/w160/${match.team2Code}.png`;

  // Draw customized vector outline map of the host country (US, MX, CA) to display beautiful pinpoint locations (looks exact to Pic 7!)
  const renderMapIllustration = () => {
    const isMX = match.country === 'Mexico';
    const isCA = match.country === 'Canada';
    
    return (
      <div className="relative w-40 h-28 mx-auto opacity-75 hover:opacity-100 transition-opacity">
        {/* Clean country map SVG illustration wrapper */}
        <svg viewBox="0 0 100 60" className="w-full h-full text-zinc-800" fill="currentColor">
          {isMX ? (
            // Mexico map outline
            <path d="M10,25 C15,20 25,18 35,22 C45,26 50,32 55,38 C60,44 65,48 70,50 C75,52 82,48 85,42 C82,44 76,46 72,42 C68,38 72,32 68,28 C64,24 55,26 50,22 C45,18 42,12 35,10 C28,8 20,12 15,18 Z" />
          ) : isCA ? (
            // Canada map outline
            <path d="M5,10 H95 V25 C85,25 75,20 65,22 C55,24 45,30 35,28 C25,26 15,22 5,18 Z" />
          ) : (
            // US map outline
            <path d="M5,15 H95 V42 C85,45 75,40 65,42 C55,44 45,35 35,38 C25,40 15,35 5,30 Z" />
          )}
        </svg>

        {/* Pinpoint circle target (Pic 7) */}
        <div className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <span className="absolute w-5 h-5 bg-orange-600 rounded-full animate-ping opacity-60" />
          <span className="w-2.5 h-2.5 bg-orange-500 border border-white rounded-full shadow-md z-10" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Ribbon of Upcoming Matches (Picture 3 style) */}
      {upcomingMatches.length > 0 && (
        <div className="max-w-6xl mx-auto mb-8 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-3 pb-2 min-w-max">
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mr-2 bg-zinc-900 border border-zinc-850 px-2.5 py-1.5 rounded-lg">Upcoming Matches:</span>
            {upcomingMatches.map((m) => {
              const upFlag1 = `https://flagcdn.com/w80/${m.team1Code}.png`;
              const upFlag2 = `https://flagcdn.com/w80/${m.team2Code}.png`;
              const code1 = m.team1.substring(0, 3).toUpperCase();
              const code2 = m.team2.substring(0, 3).toUpperCase();

              return (
                <Link
                  key={m.id}
                  to={`/world-cup/${m.id}`}
                  className="bg-white hover:bg-zinc-100 text-zinc-900 duration-150 transform hover:scale-[1.01] px-4 py-2 rounded-xl flex items-center space-x-3 shadow-md hover:shadow-lg transition-all border border-zinc-200"
                >
                  <div className="flex items-center space-x-1.5">
                    <img src={upFlag1} alt={m.team1} className="w-5.5 h-3.5 object-contain rounded-sm" referrerPolicy="no-referrer" />
                    <span className="text-[11px] font-black tracking-tight text-zinc-800">{code1}</span>
                  </div>

                  <div className="border-l border-r border-zinc-150 px-2.5 py-0.5 text-center flex flex-col justify-center min-w-[70px]">
                    <span className="text-[9px] font-extrabold text-[#E05424] uppercase tracking-wider leading-none mb-0.5">{m.date}</span>
                    <span className="text-[11px] font-black text-zinc-950 leading-none">{m.time}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <img src={upFlag2} alt={m.team2} className="w-5.5 h-3.5 object-contain rounded-sm" referrerPolicy="no-referrer" />
                    <span className="text-[11px] font-black tracking-tight text-zinc-800">{code2}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Line */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link to="/world-cup" className="inline-flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors font-semibold group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>All World Cup Matches</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* --- MAIN HEADER METADATA (Pic 7 layout) --- */}
        <div className="text-center mb-8">
          <span className="inline-flex px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-400">
            GROUP STAGE • Group {match.group}
          </span>
          <h2 className="text-md font-semibold text-zinc-400 mt-2 flex items-center justify-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span>{match.stadium}, {match.city}</span>
          </h2>

          {/* Map Outline component */}
          <div className="mt-4">
            {renderMapIllustration()}
          </div>

          {/* Real-time viewer count stats badge */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center space-x-1.5 bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-3.5 py-1.5 rounded-full font-extrabold uppercase tracking-widest animate-pulse shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>{formatViewerCount(getCalculatedLiveViewers(match.id, `${match.team1} vs ${match.team2}`, 'meci', 9.5, liveViewers))} spectatori în direct</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs px-3.5 py-1.5 rounded-full font-bold">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Transmisiune În Direct HD</span>
            </span>
          </div>
        </div>

        {/* --- PRIMARY MATCH BOARD (Pic 7 design) --- */}
        <div className="bg-zinc-900/30 border border-zinc-850 rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
          {/* subtle container overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/1 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            {/* Team 1 Panel */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="w-32 h-20 rounded-xl bg-zinc-950 border border-zinc-800 p-2 overflow-hidden shadow-inner flex items-center justify-center transform hover:scale-[1.03] transition-transform duration-300">
                <img 
                  src={flag1} 
                  alt={match.team1} 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white mt-4 tracking-tight">
                {match.team1}
              </h3>
            </div>

            {/* Central Info Card or Dynamic Score Board */}
            {liveState.status === 'scheduled' ? (
              <div className="flex flex-col items-center justify-center px-6 py-4.5 rounded-2xl bg-white text-zinc-950 font-sans shadow-xl min-w-[140px] transform hover:scale-[1.02] transition-transform duration-300 self-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">IUNIE</span>
                <span className="text-3xl font-black text-zinc-900 my-0.5 leading-none">
                  {match.date.split('.')[0]}
                </span>
                <span className="text-xs font-bold text-zinc-650 font-mono">{match.time}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-7 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-sans shadow-2xl min-w-[145px] hover:border-amber-500/35 transition-all self-center select-none relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-550 mb-1">Match {liveState.status === 'live' ? 'Live' : 'Finished'}</span>
                <div className="flex items-center space-x-2 font-mono text-3xl font-black text-white leading-none">
                  <span>{liveState.score1}</span>
                  <span className="text-amber-500">:</span>
                  <span>{liveState.score2}</span>
                </div>
                {liveState.status === 'live' ? (
                  <span className="inline-flex items-center text-[8px] sm:text-[9px] bg-red-600/10 border border-red-500/30 text-red-500 px-2 py-0.5 rounded-md mt-2 font-black uppercase tracking-wider animate-pulse">
                    LIVE • {liveState.liveMinute}
                  </span>
                ) : (
                  <span className="text-[9px] text-zinc-500 mt-2 font-extrabold uppercase tracking-wide">
                    FINAL
                  </span>
                )}
              </div>
            )}

            {/* Team 2 Panel */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="w-32 h-20 rounded-xl bg-zinc-950 border border-zinc-800 p-2 overflow-hidden shadow-inner flex items-center justify-center transform hover:scale-[1.03] transition-transform duration-300">
                <img 
                  src={flag2} 
                  alt={match.team2} 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white mt-4 tracking-tight">
                {match.team2}
              </h3>
            </div>
          </div>
        </div>

        {/* --- LIVE COUNTDOWN TIMER BLOCK (Pic 7 style) --- */}
        {!countdown.isLive && (
          <div className="text-center mb-10">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E05424] mb-3">
              LIVE IN
            </h4>
            <div className="inline-flex items-center justify-center space-x-3 bg-zinc-900/20 border border-zinc-850 p-4 rounded-2xl shadow-lg">
              {/* Hours Card */}
              <div className="flex flex-col items-center">
                <div className="w-13 h-14 rounded-xl bg-zinc-100 border border-zinc-250 flex items-center justify-center shadow-lg text-zinc-900 font-mono text-2xl font-extrabold">
                  {countdown.hours.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-zinc-550 mt-1.5 font-bold uppercase">hours</span>
              </div>
              <span className="text-xl text-zinc-600 font-bold">:</span>

              {/* Mins Card */}
              <div className="flex flex-col items-center">
                <div className="w-13 h-14 rounded-xl bg-zinc-100 border border-zinc-250 flex items-center justify-center shadow-lg text-zinc-900 font-mono text-2xl font-extrabold">
                  {countdown.minutes.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-zinc-550 mt-1.5 font-bold uppercase">mins</span>
              </div>
              <span className="text-xl text-zinc-600 font-bold">:</span>

              {/* Secs Card */}
              <div className="flex flex-col items-center">
                <div className="w-13 h-14 rounded-xl bg-zinc-100 border border-zinc-250 flex items-center justify-center shadow-lg text-zinc-900 font-mono text-2xl font-extrabold">
                  {countdown.seconds.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-zinc-550 mt-1.5 font-bold uppercase font-sans">secs</span>
              </div>
            </div>
          </div>
        )}

        {/* --- STREAM AND DETAILS HUB --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Player block (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex border-b border-zinc-850 pb-px">
              {[
                { id: 'stream', label: 'Live Stream Player' },
                { id: 'stats', label: 'Stats & Predictions' },
                { id: 'lineups', label: 'Probable Lineups' },
                { id: 'replay', label: 'Replay (MP4)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-bold border-b-2 mr-6 transition-all ${activeTab === tab.id ? 'border-amber-500 text-amber-500 font-extrabold' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'stream' ? (
              <div className="space-y-4">
                {/* Embedded Video Player Container */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                  
                  {liveState.status !== 'scheduled' ? (
                    isCurrentActive ? (
                      currentEmbedCode ? (
                        <div 
                          className="w-full h-full relative"
                          dangerouslySetInnerHTML={{ __html: enhanceEmbedCode(currentEmbedCode) }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-950">
                          <Tv className="w-8 h-8 text-zinc-650 mb-3 animate-pulse" />
                          <p className="text-zinc-400 font-bold text-sm">Signal currently unavailable</p>
                          <p className="text-zinc-600 text-xs mt-1">This player does not have a stream code configured in the admin panel.</p>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-zinc-950 to-zinc-900 border border-red-500/10">
                        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
                        <p className="text-white font-black text-sm sm:text-base uppercase tracking-wider">PLAYER UNAVAILABLE</p>
                        <p className="text-zinc-550 font-medium text-xs mt-2 max-w-sm px-4 leading-relaxed font-sans">
                          This player has been disabled by the administrator. Please choose another available source (Player 1, 2, or 3) below.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-zinc-900 to-zinc-950">
                      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-zinc-650" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-450">Waiting</span>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                        <Tv className="w-8 h-8 text-amber-500 animate-pulse" />
                      </div>
                      <p className="text-zinc-200 font-extrabold text-sm sm:text-base">Embedded broadcast currently unavailable</p>
                      <p className="text-zinc-450 font-medium text-xs mt-1.5 max-w-md px-4 leading-relaxed font-sans">
                        The secure TV player will activate automatically when the game officially starts ({match.date} at {match.time}).
                      </p>
                      <div className="mt-5 flex items-center space-x-2 bg-zinc-950 border border-zinc-850 px-4 py-2.5 rounded-xl text-xs font-mono text-amber-500 font-bold shadow-inner">
                        <span>Waiting:</span>
                        <span>{countdown.hours.toString().padStart(2, '0')}h {countdown.minutes.toString().padStart(2, '0')}m {countdown.seconds.toString().padStart(2, '0')}s</span>
                      </div>
                    </div>
                  )}

                  {/* Absolute Stream controls mimic */}
                  <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">LIVE HD</span>
                  </div>
                </div>

                {/* --- 3-PLAYER SELECTOR STATION --- */}
                <div className="bg-zinc-900/10 border border-zinc-850 p-4.5 rounded-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Playback Channels (Alternative Sources)</h4>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        If a source has interruptions, please select another player from the list.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {[
                        { key: 'player1', label: 'Player 1', active: playerConfig?.player1Active ?? true },
                        { key: 'player2', label: 'Player 2', active: playerConfig?.player2Active ?? false },
                        { key: 'player3', label: 'Player 3', active: playerConfig?.player3Active ?? false }
                      ].map((p) => (
                        <button
                          key={p.key}
                          onClick={() => setActivePlayerSource(p.key as any)}
                          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                            activePlayerSource === p.key
                              ? 'bg-amber-500 border-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span>{p.label}</span>
                          {!p.active && (
                            <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-tight scale-90">
                              Unavailable
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'stats' ? (
              <div className="bg-zinc-900/25 border border-zinc-850 rounded-2xl p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-zinc-300 mb-4 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Community Predictions: Who will win?</span>
                  </h4>

                  {voted ? (
                    <div className="space-y-4">
                      {/* Team 1 result */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5 text-zinc-400">
                          <span>{match.team1}</span>
                          <span className="text-amber-500">{votePercentages.team1}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${votePercentages.team1}%` }} />
                        </div>
                      </div>

                      {/* Draw result */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5 text-zinc-400">
                          <span>Draw</span>
                          <span className="text-zinc-550">{votePercentages.draw}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-650 rounded-full transition-all duration-500" style={{ width: `${votePercentages.draw}%` }} />
                        </div>
                      </div>

                      {/* Team 2 result */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5 text-zinc-400">
                          <span>{match.team2}</span>
                          <span className="text-amber-500">{votePercentages.team2}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${votePercentages.team2}%` }} />
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-550 text-center font-semibold italic">Thank you for voting! Your vote has been processed.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleVote('team1')}
                        className="p-3.5 bg-zinc-950 hover:bg-zinc-850 rounded-xl border border-zinc-850 hover:border-zinc-700 text-center text-xs font-bold transition-all text-zinc-300"
                      >
                        {match.team1}
                      </button>
                      <button
                        onClick={() => handleVote('draw')}
                        className="p-3.5 bg-zinc-950 hover:bg-zinc-850 rounded-xl border border-zinc-850 hover:border-zinc-700 text-center text-xs font-bold transition-all text-zinc-400"
                      >
                        Draw
                      </button>
                      <button
                        onClick={() => handleVote('team2')}
                        className="p-3.5 bg-zinc-950 hover:bg-zinc-850 rounded-xl border border-zinc-850 hover:border-zinc-700 text-center text-xs font-bold transition-all text-zinc-300"
                      >
                        {match.team2}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-850/60 pt-6">
                  <h4 className="text-sm font-bold text-zinc-300 mb-4">Head-to-Head (H2H)</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-zinc-950/40 rounded-lg text-zinc-400 font-semibold">
                      <span>World Cup 2022</span>
                      <span className="font-mono text-white">{match.team1} 2 - 1 {match.team2}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-zinc-950/40 rounded-lg text-zinc-400 font-semibold">
                      <span>International Friendly 2024</span>
                      <span className="font-mono text-white">{match.team1} 1 - 1 {match.team2}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'lineups' ? (
              /* Probable Lineups */
              <div className="bg-zinc-900/25 border border-zinc-850 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-8 text-xs font-medium">
                  {/* Team 1 proposed */}
                  <div>
                    <h5 className="font-bold text-amber-500 mb-3 uppercase tracking-wider">{match.team1} (4-3-3)</h5>
                    <ul className="space-y-2 text-zinc-400">
                      <li>Ochoa (GK)</li>
                      <li>Montes (GK)</li>
                      <li>Sanchez</li>
                      <li>Gallardo</li>
                      <li>Alvarez</li>
                      <li>Chavez</li>
                      <li>Pineda</li>
                      <li>Lozano</li>
                      <li>Martin</li>
                      <li>Gimenez</li>
                      <li>Antuna</li>
                    </ul>
                  </div>

                  {/* Team 2 proposed */}
                  <div>
                    <h5 className="font-bold text-amber-500 mb-3 uppercase tracking-wider">{match.team2} (4-2-3-1)</h5>
                    <ul className="space-y-2 text-zinc-400">
                      <li>Williams (GK)</li>
                      <li>Modiba</li>
                      <li>Xulu</li>
                      <li>Mvala</li>
                      <li>Mudau</li>
                      <li>Mokoena</li>
                      <li>Sithole</li>
                      <li>Zwane</li>
                      <li>Tau</li>
                      <li>Morena</li>
                      <li>Lepasa</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              /* Replay */
              <div className="bg-zinc-900/25 border border-zinc-850 rounded-2xl p-6 text-zinc-300">
                {playerConfig?.replayEmbed ? (
                  <video className="plyr-video w-full rounded-xl border border-zinc-800" controls>
                    <source src={playerConfig.replayEmbed} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="text-center py-10 text-zinc-500 text-sm">
                    Match replay is not yet available.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Live Chat Block (1 Col) */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col h-[480px] shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-850 bg-zinc-900/60 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4.5 h-4.5 text-amber-500" />
                  <span className="text-sm font-bold text-zinc-200">Supporter Chat</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-zinc-550" />
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">{liveViewers} online</span>
                </div>
              </div>

              {/* Chat messages stream */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className={`font-bold ${
                        msg.team === 'team1' ? 'text-amber-500' : (msg.team === 'team2' ? 'text-indigo-400' : 'text-zinc-400')
                      }`}>
                        {msg.user}
                      </span>
                      <span className="text-[9px] text-zinc-700 font-mono">{msg.time}</span>
                    </div>
                    <p className="text-zinc-350 leading-relaxed break-words bg-zinc-950/40 p-2 rounded-lg border border-zinc-900">
                      {msg.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-850 bg-zinc-900/60 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Send a comment..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-amber-500 text-zinc-950 hover:bg-amber-600 rounded-xl transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Dynamic user nickname adjustment display */}
              <div className="px-3 pb-3 pt-1.5 bg-zinc-900/45 border-t border-zinc-850/60 text-[10px] text-zinc-550 flex items-center justify-between">
                <span>Sending as: <strong className="text-zinc-350 font-bold">{typeof window !== 'undefined' ? localStorage.getItem('chat_nickname') || 'New_Supporter' : 'Supporter'}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    const currentNick = localStorage.getItem('chat_nickname') || 'New_Supporter';
                    const customName = prompt('Enter custom chat nickname:', currentNick);
                    if (customName && customName.trim()) {
                      localStorage.setItem('chat_nickname', customName.trim().substring(0, 25));
                      window.location.reload();
                    }
                  }}
                  className="text-amber-500 font-bold hover:underline hover:text-amber-400 transition-colors"
                >
                  Change Nickname
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
