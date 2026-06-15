import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Trophy, Calendar, MapPin, PlayCircle, Eye, ArrowRight, Table } from 'lucide-react';
import { TEAM_FLAGS, WCMatch, getMatchLiveStatus, getActiveTime } from './worldCupData';
import { api } from '../../lib/api';

export default function WorldCupPage() {
  const [matches, setMatches] = useState<WCMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<number>(0); // 0 means All, 1, 2, 3
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches');
  const [simulationActive, setSimulationActive] = useState(localStorage.getItem('wc_simulation_active') === 'true');
  const [liveViewersStats, setLiveViewersStats] = useState<Record<string, number>>({});

  useEffect(() => {
    api.getWorldCupMatches().then((data) => {
      setMatches(data);
      setLoading(false);
    });
    api.getWorldCupMatchViews().then(views => {
      setLiveViewersStats(views);
    });
  }, []);

  // Sync simulation checkbox if modified on other screens
  useEffect(() => {
    const handleSync = () => {
      setSimulationActive(localStorage.getItem('wc_simulation_active') === 'true');
    };
    window.addEventListener('wc_sim_change', handleSync);
    return () => window.removeEventListener('wc_sim_change', handleSync);
  }, []);

  // Remove automatic polling of dummy stats

  // Filter matches based on round and query
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchRound = selectedRound === 0 || match.round === selectedRound;
      const matchQuery = searchQuery === '' || 
        match.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRound && matchQuery;
    });
  }, [matches, selectedRound, searchQuery]);

  // Enrich filtered matches with their real-time live or simulation score states
  const renderedMatches = useMemo(() => {
    const activeTime = getActiveTime();
    return filteredMatches.map(match => {
      const liveState = getMatchLiveStatus(match, activeTime);
      return {
        ...match,
        liveState
      };
    });
  }, [filteredMatches, simulationActive]);

  // Group matches by round for presentation
  const groupedMatches = useMemo(() => {
    const groups: Record<number, any[]> = { 1: [], 2: [], 3: [] };
    renderedMatches.forEach(match => {
      if (groups[match.round]) {
        groups[match.round].push(match);
      }
    });
    return groups;
  }, [renderedMatches]);


  // Compute dynamic standings tables based on computed match results
  const groupStandings = useMemo(() => {
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const activeTime = getActiveTime();
    
    return groups.map(gName => {
      const matchesInGroup = matches.filter(m => m.group === gName);
      
      // Get all unique teams in this group
      const teamsInGroup = Array.from(new Set(
        matchesInGroup.flatMap(m => [m.team1, m.team2])
      ));
      
      // Initialize team stats
      const statsMap: Record<string, {
        team: string;
        played: number;
        win: number;
        draw: number;
        loss: number;
        gf: number;
        ga: number;
        points: number;
      }> = {};
      
      teamsInGroup.forEach(team => {
        statsMap[team] = { team, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0 };
      });
      
      // Process finished match results
      matchesInGroup.forEach(match => {
        const liveState = getMatchLiveStatus(match, activeTime);
        if (liveState.status === 'finished') {
          const t1 = match.team1;
          const t2 = match.team2;
          const s1 = liveState.score1;
          const s2 = liveState.score2;
          
          if (!statsMap[t1] || !statsMap[t2]) return;
          
          statsMap[t1].played += 1;
          statsMap[t2].played += 1;
          statsMap[t1].gf += s1;
          statsMap[t2].gf += s2;
          statsMap[t1].ga += s2;
          statsMap[t2].ga += s1;
          
          if (s1 > s2) {
            statsMap[t1].win += 1;
            statsMap[t2].loss += 1;
            statsMap[t1].points += 3;
          } else if (s2 > s1) {
            statsMap[t2].win += 1;
            statsMap[t1].loss += 1;
            statsMap[t2].points += 3;
          } else {
            statsMap[t1].draw += 1;
            statsMap[t2].draw += 1;
            statsMap[t1].points += 1;
            statsMap[t2].points += 1;
          }
        }
      });
      
      const standings = Object.values(statsMap).map(row => ({
        ...row,
        code: TEAM_FLAGS[row.team] || 'un',
        gd: row.gf - row.ga
      }));
      
      // Sort: points desc, gd desc, gf desc, team name
      standings.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
      
      return {
        group: gName,
        standings
      };
    });
  }, [matches, simulationActive]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-indigo-950/45 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
          
          <div className="relative z-10 flex-1">
            <div className="inline-flex items-center space-x-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs px-3.5 py-1.5 rounded-full font-bold mb-4 uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              <span>FIFA World Cup 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              World Cup 2026
            </h1>
            <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
              Watch all tournament matches live taking place in the United States, Mexico, and Canada. Live streams, group statistics, broadcast times, and full countdown.
            </p>
          </div>

          <div className="relative z-10 w-44 h-44 flex items-center justify-center p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm shadow-xl">
            <Trophy className="w-24 h-24 text-amber-500 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-bold">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-bold">No matches available.</div>
        ) : (
          <>
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 pb-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'matches' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Live Matches & Schedule</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex-1 pb-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'standings' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Table className="w-4 h-4" />
              <span>Group Standings</span>
            </div>
          </button>
        </div>

        {activeTab === 'matches' ? (
          <>
            {/* Filtering & Search Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              {/* Round Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 0, label: 'All Rounds' },
                  { value: 1, label: 'Round 1' },
                  { value: 2, label: 'Round 2' },
                  { value: 3, label: 'Round 3' },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedRound(tab.value)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                      selectedRound === tab.value
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                        : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-550" />
                <input
                  type="text"
                  placeholder="Search for a country, group or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-550 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Match Presentation Grid */}
            <div className="space-y-10">
              {[1, 2, 3].map(roundNum => {
                const matchesInRound = groupedMatches[roundNum] || [];
                if ((selectedRound !== 0 && selectedRound !== roundNum) || matchesInRound.length === 0) return null;

                return (
                  <div key={roundNum} className="space-y-4">
                    <div className="flex items-center space-x-3 border-b border-zinc-900 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                      <h2 className="text-lg font-bold tracking-wider text-zinc-350 uppercase">Round {roundNum}</h2>
                      <span className="text-xs text-zinc-550 font-semibold font-mono">({matchesInRound.length} matches)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matchesInRound.map(match => {
                        const flag1 = `https://flagcdn.com/w80/${match.team1Code}.png`;
                        const flag2 = `https://flagcdn.com/w80/${match.team2Code}.png`;
                        
                        return (
                          <Link
                            key={match.id}
                            to={`/world-cup/${match.id}`}
                            className="group block bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/60 rounded-2xl p-4.5 transition-all hover:scale-[1.01] shadow-lg relative overflow-hidden"
                          >
                            {/* Card Decorative background overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            {/* Header group and stadium info */}
                            <div className="flex justify-between items-center text-xs text-zinc-500 mb-3.5 font-semibold font-sans">
                              <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-md">
                                Group {match.group}
                              </span>
                              <span className="flex items-center max-w-[200px] truncate text-zinc-550 font-medium">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                {match.city}
                              </span>
                            </div>

                            {/* Center Row: Teams and Date Card */}
                            <div className="flex items-center justify-between mb-4 mt-2">
                              {/* Team 1 */}
                              <div className="flex flex-col items-center flex-1 text-center truncate pr-2">
                                <div className="w-13 h-9 rounded-md bg-zinc-950 flex items-center justify-center p-1 border border-zinc-800 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                  <img 
                                    src={flag1} 
                                    alt={match.team1} 
                                    className="w-full h-full object-contain" 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      // Fallback to text initials if flag fails
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-zinc-250 mt-2 group-hover:text-amber-500 transition-colors truncate max-w-[100px]">
                                  {match.team1}
                                </span>
                              </div>

                              {/* Center Date or Dynamic Scoreboard Badge */}
                              {match.liveState.status === 'scheduled' ? (
                                <div className="flex flex-col items-center justify-center px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-md min-w-[80px]">
                                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{match.date}</span>
                                  <span className="text-[12px] font-mono font-extrabold text-amber-500 mt-1">{match.time}</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-md min-w-[85px] relative">
                                  <div className="flex items-center space-x-1 font-mono text-base font-black text-white hover:text-amber-500 transition-colors">
                                    <span>{match.liveState.score1}</span>
                                    <span className="text-zinc-650">:</span>
                                    <span>{match.liveState.score2}</span>
                                  </div>
                                  {match.liveState.status === 'live' ? (
                                    <span className="text-[8px] sm:text-[9px] bg-red-500/15 border border-red-500/25 text-red-500 px-1.5 py-0.5 rounded-md mt-1.5 font-bold uppercase tracking-wider animate-pulse whitespace-nowrap">
                                      LIVE • {match.liveState.liveMinute}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-zinc-550 mt-1.5 font-bold uppercase tracking-wider">
                                      FINAL
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Team 2 */}
                              <div className="flex flex-col items-center flex-1 text-center truncate pl-2">
                                <div className="w-13 h-9 rounded-md bg-zinc-950 flex items-center justify-center p-1 border border-zinc-800 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                  <img 
                                    src={flag2} 
                                    alt={match.team2} 
                                    className="w-full h-full object-contain" 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-zinc-250 mt-2 group-hover:text-amber-500 transition-colors truncate max-w-[100px]">
                                  {match.team2}
                                </span>
                              </div>
                            </div>

                            {/* Footer broadcast row */}
                            <div className="border-t border-zinc-800/60 pt-3 flex items-center justify-between text-xs font-semibold">
                              <span className="text-zinc-500 font-medium flex items-center">
                                <Eye className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
                                <span className="text-zinc-400 font-extrabold mr-1">
                                  {liveViewersStats[`/world-cup/${match.id}`] || 0}
                                </span>
                                <span>vizualizări totale</span>
                              </span>
                              <div className="flex items-center space-x-1.5 text-zinc-400 group-hover:text-amber-500 transition-colors">
                                <PlayCircle className="w-4 h-4 fill-amber-500/10 text-amber-500 animate-pulse" />
                                <span>Match details</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Standings View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {groupStandings.map(group => (
              <div key={group.group} className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-850">
                  <h3 className="font-bold text-zinc-300">Group {group.group}</h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Stage 3/3</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="text-zinc-550 border-b border-zinc-850 pb-2 font-bold uppercase text-[10px]">
                        <th className="py-2">Team</th>
                        <th className="py-2 text-center">M</th>
                        <th className="py-2 text-center">GM</th>
                        <th className="py-2 text-center">+/-</th>
                        <th className="py-2 text-right">Pct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/40 text-zinc-300">
                      {group.standings.map((row, index) => (
                        <tr key={row.team} className="hover:bg-zinc-950/40 transition-colors font-medium">
                          <td className="py-2.5 flex items-center space-x-2 truncate max-w-[130px]">
                            <span className={`w-1.5 h-1.5 rounded-full ${index < 2 ? 'bg-emerald-500' : 'bg-transparent'}`} title={index < 2 ? 'Major Qualification' : ''} />
                            <img 
                              src={`https://flagcdn.com/w80/${row.code}.png`} 
                              alt={row.team} 
                              className="w-4.5 h-3 object-contain rounded flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="truncate">{row.team}</span>
                          </td>
                          <td className="py-2.5 text-center font-mono text-zinc-400">{row.played}</td>
                          <td className="py-2.5 text-center font-mono text-zinc-400">{row.gf}</td>
                          <td className="py-2.5 text-center font-mono text-zinc-400">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-amber-500">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
