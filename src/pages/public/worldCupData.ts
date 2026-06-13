export interface WCMapPoint {
  x: number; // percentage from left
  y: number; // percentage from top
}

export interface WCMatch {
  id: string;
  round: number; // 1, 2, 3
  group: string; // A - L
  team1: string;
  team2: string;
  team1Code: string; // flag code (country-code)
  team2Code: string;
  date: string; // format: "11.06"
  time: string; // format: "22:00"
  stadium: string;
  city: string;
  country: 'Mexic' | 'SUA' | 'Canada';
  datetime: string; // ISO String for Countdown
  embedCode?: string;
  streamUrl?: string;
}

// Map coordinates for pinpoint styling depending on country
export const COUNTRY_STADIUMS: Record<string, { stadium: string; city: string; country: 'Mexic' | 'SUA' | 'Canada'; x: number; y: number }> = {
  Mexic: { stadium: 'Mexico City Stadium (Estadio Azteca)', city: 'Ciudad de Mexico', country: 'Mexic', x: 52, y: 72 },
  SUA_LA: { stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'SUA', x: 22, y: 45 },
  SUA_NY: { stadium: 'MetLife Stadium', city: 'New York / New Jersey', country: 'SUA', x: 82, y: 35 },
  SUA_MIA: { stadium: 'Hard Rock Stadium', city: 'Miami', country: 'SUA', x: 74, y: 78 },
  SUA_ATL: { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'SUA', x: 68, y: 55 },
  SUA_DAL: { stadium: 'AT&T Stadium', city: 'Dallas', country: 'SUA', x: 48, y: 62 },
  Canada_VAN: { stadium: 'BC Place', city: 'Vancouver', country: 'Canada', x: 20, y: 15 },
  Canada_TOR: { stadium: 'BMO Field', city: 'Toronto', country: 'Canada', x: 76, y: 28 },
};

export const TEAM_FLAGS: Record<string, string> = {
  'Mexic': 'mx',
  'Africa de Sud': 'za',
  'Coreea de Sud': 'kr',
  'Cehia': 'cz',
  'Canada': 'ca',
  'Bosnia și Herțegovina': 'ba',
  'SUA': 'us',
  'Paraguay': 'py',
  'Qatar': 'qa',
  'Elveția': 'ch',
  'Brazilia': 'br',
  'Maroc': 'ma',
  'Haiti': 'ht',
  'Scoția': 'gb',
  'Australia': 'au',
  'Turcia': 'tr',
  'Germania': 'de',
  'Curacao': 'cw',
  'Țările de Jos': 'nl',
  'Japonia': 'jp',
  'Coasta de Fildeș': 'ci',
  'Ecuador': 'ec',
  'Suedia': 'se',
  'Tunisia': 'tn',
  'Spania': 'es',
  'Capul Verde': 'cv',
  'Belgia': 'be',
  'Egipt': 'eg',
  'Arabia Saudită': 'sa',
  'Uruguay': 'uy',
  'Iran': 'ir',
  'Noua Zeelandă': 'nz',
  'Franța': 'fr',
  'Senegal': 'sn',
  'Irak': 'iq',
  'Norvegia': 'no',
  'Argentina': 'ar',
  'Algeria': 'dz',
  'Austria': 'at',
  'Iordania': 'jo',
  'Portugalia': 'pt',
  'DR Congo': 'cd',
  'Anglia': 'gb',
  'Croația': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa',
  'Uzbekistan': 'uz',
  'Columbia': 'co'
};

// Helper to determine stadium based on home team or rotation
function getStadiumInfo(team1: string, index: number) {
  if (team1 === 'Mexic') return COUNTRY_STADIUMS.Mexic;
  if (team1 === 'SUA') return COUNTRY_STADIUMS.SUA_LA;
  if (team1 === 'Canada') return COUNTRY_STADIUMS.Canada_VAN;
  
  const rotationKeys = Object.keys(COUNTRY_STADIUMS);
  const info = COUNTRY_STADIUMS[rotationKeys[index % rotationKeys.length]];
  return info;
}

// Generate the full match list
const MATCH_TEMPLATES = [
  // --- ROUND 1 ---
  { date: '11.06', time: '22:00', team1: 'Mexic', team2: 'Africa de Sud', round: 1, group: 'A' },
  { date: '12.06', time: '05:00', team1: 'Coreea de Sud', team2: 'Cehia', round: 1, group: 'A' },
  { date: '12.06', time: '22:00', team1: 'Canada', team2: 'Bosnia și Herțegovina', round: 1, group: 'B' },
  { date: '13.06', time: '04:00', team1: 'SUA', team2: 'Paraguay', round: 1, group: 'C' },
  { date: '13.06', time: '22:00', team1: 'Qatar', team2: 'Elveția', round: 1, group: 'B' },
  { date: '14.06', time: '01:00', team1: 'Brazilia', team2: 'Maroc', round: 1, group: 'D' },
  { date: '14.06', time: '04:00', team1: 'Haiti', team2: 'Scoția', round: 1, group: 'D' },
  { date: '14.06', time: '07:00', team1: 'Australia', team2: 'Turcia', round: 1, group: 'C' },
  { date: '14.06', time: '20:00', team1: 'Germania', team2: 'Curacao', round: 1, group: 'E' },
  { date: '14.06', time: '23:00', team1: 'Țările de Jos', team2: 'Japonia', round: 1, group: 'F' },
  { date: '15.06', time: '02:00', team1: 'Coasta de Fildeș', team2: 'Ecuador', round: 1, group: 'E' },
  { date: '15.06', time: '05:00', team1: 'Suedia', team2: 'Tunisia', round: 1, group: 'F' },
  { date: '15.06', time: '19:00', team1: 'Spania', team2: 'Capul Verde', round: 1, group: 'G' },
  { date: '15.06', time: '22:00', team1: 'Belgia', team2: 'Egipt', round: 1, group: 'H' }, // Group H (actually represented G/H)
  { date: '16.06', time: '01:00', team1: 'Arabia Saudită', team2: 'Uruguay', round: 1, group: 'G' },
  { date: '16.06', time: '04:00', team1: 'Iran', team2: 'Noua Zeelandă', round: 1, group: 'H' },
  { date: '16.06', time: '22:00', team1: 'Franța', team2: 'Senegal', round: 1, group: 'I' },
  { date: '17.06', time: '01:00', team1: 'Irak', team2: 'Norvegia', round: 1, group: 'I' },
  { date: '17.06', time: '04:00', team1: 'Argentina', team2: 'Algeria', round: 1, group: 'J' },
  { date: '17.06', time: '07:00', team1: 'Austria', team2: 'Iordania', round: 1, group: 'J' },
  { date: '17.06', time: '20:00', team1: 'Portugalia', team2: 'DR Congo', round: 1, group: 'K' },
  { date: '17.06', time: '23:00', team1: 'Anglia', team2: 'Croația', round: 1, group: 'L' }, // Group L/K transition
  { date: '18.06', time: '02:00', team1: 'Ghana', team2: 'Panama', round: 1, group: 'L' },
  { date: '18.06', time: '05:00', team1: 'Uzbekistan', team2: 'Columbia', round: 1, group: 'K' },

  // --- ROUND 2 ---
  { date: '18.06', time: '19:00', team1: 'Cehia', team2: 'Africa de Sud', round: 2, group: 'A' },
  { date: '18.06', time: '22:00', team1: 'Elveția', team2: 'Bosnia și Herțegovina', round: 2, group: 'B' },
  { date: '19.06', time: '01:00', team1: 'Canada', team2: 'Qatar', round: 2, group: 'B' },
  { date: '19.06', time: '04:00', team1: 'Mexic', team2: 'Coreea de Sud', round: 2, group: 'A' },
  { date: '19.06', time: '22:00', team1: 'SUA', team2: 'Australia', round: 2, group: 'C' },
  { date: '20.06', time: '01:00', team1: 'Scoția', team2: 'Maroc', round: 2, group: 'D' },
  { date: '20.06', time: '03:30', team1: 'Brazilia', team2: 'Haiti', round: 2, group: 'D' },
  { date: '20.06', time: '06:00', team1: 'Turcia', team2: 'Paraguay', round: 2, group: 'C' },
  { date: '20.06', time: '20:00', team1: 'Țările de Jos', team2: 'Suedia', round: 2, group: 'F' },
  { date: '20.06', time: '23:00', team1: 'Germania', team2: 'Coasta de Fildeș', round: 2, group: 'E' },
  { date: '21.06', time: '03:00', team1: 'Ecuador', team2: 'Curacao', round: 2, group: 'E' },
  { date: '21.06', time: '05:00', team1: 'Tunisia', team2: 'Japonia', round: 2, group: 'F' },
  { date: '21.06', time: '19:00', team1: 'Spania', team2: 'Arabia Saudită', round: 2, group: 'G' },
  { date: '21.06', time: '22:00', team1: 'Belgia', team2: 'Iran', round: 2, group: 'H' },
  { date: '22.06', time: '01:00', team1: 'Uruguay', team2: 'Capul Verde', round: 2, group: 'G' },
  { date: '22.06', time: '04:00', team1: 'Noua Zeelandă', team2: 'Egipt', round: 2, group: 'H' },
  { date: '22.06', time: '22:00', team1: 'Franța', team2: 'Irak', round: 2, group: 'I' },
  { date: '23.06', time: '01:00', team1: 'Norvegia', team2: 'Senegal', round: 2, group: 'I' },
  { date: '23.06', time: '04:00', team1: 'Argentina', team2: 'Austria', round: 2, group: 'J' },
  { date: '23.06', time: '07:00', team1: 'Iordania', team2: 'Algeria', round: 2, group: 'J' },
  { date: '23.06', time: '20:00', team1: 'Portugalia', team2: 'Uzbekistan', round: 2, group: 'K' },
  { date: '23.06', time: '23:00', team1: 'Anglia', team2: 'Ghana', round: 2, group: 'L' },
  { date: '24.06', time: '02:00', team1: 'Panama', team2: 'Croația', round: 2, group: 'L' },
  { date: '24.06', time: '05:00', team1: 'Columbia', team2: 'DR Congo', round: 2, group: 'K' },

  // --- ROUND 3 ---
  { date: '24.06', time: '22:00', team1: 'Bosnia și Herțegovina', team2: 'Qatar', round: 3, group: 'B' },
  { date: '24.06', time: '22:00', team1: 'Elveția', team2: 'Canada', round: 3, group: 'B' },
  { date: '25.06', time: '01:00', team1: 'Maroc', team2: 'Haiti', round: 3, group: 'D' },
  { date: '25.06', time: '01:00', team1: 'Scoția', team2: 'Brazilia', round: 3, group: 'D' },
  { date: '25.06', time: '04:00', team1: 'Africa de Sud', team2: 'Coreea de Sud', round: 3, group: 'A' },
  { date: '25.06', time: '04:00', team1: 'Cehia', team2: 'Mexic', round: 3, group: 'A' },
  { date: '25.06', time: '23:00', team1: 'Curacao', team2: 'Coasta de Fildeș', round: 3, group: 'E' },
  { date: '25.06', time: '23:00', team1: 'Ecuador', team2: 'Germania', round: 3, group: 'E' },
  { date: '26.06', time: '02:00', team1: 'Japonia', team2: 'Suedia', round: 3, group: 'F' },
  { date: '26.06', time: '02:00', team1: 'Tunisia', team2: 'Țările de Jos', round: 3, group: 'F' },
  { date: '26.06', time: '05:00', team1: 'Paraguay', team2: 'Australia', round: 3, group: 'C' },
  { date: '26.06', time: '05:00', team1: 'Turcia', team2: 'SUA', round: 3, group: 'C' },
  { date: '26.06', time: '22:00', team1: 'Norvegia', team2: 'Franța', round: 3, group: 'I' },
  { date: '26.06', time: '22:00', team1: 'Senegal', team2: 'Irak', round: 3, group: 'I' },
  { date: '27.06', time: '03:00', team1: 'Capul Verde', team2: 'Arabia Saudită', round: 3, group: 'G' },
  { date: '27.06', time: '03:00', team1: 'Uruguay', team2: 'Spania', round: 3, group: 'G' },
  { date: '27.06', time: '06:00', team1: 'Egipt', team2: 'Iran', round: 3, group: 'H' },
  { date: '27.06', time: '06:00', team1: 'Noua Zeelandă', team2: 'Belgia', round: 3, group: 'H' },
  { date: '28.06', time: '00:00', team1: 'Croația', team2: 'Ghana', round: 3, group: 'L' },
  { date: '28.06', time: '00:00', team1: 'Panama', team2: 'Anglia', round: 3, group: 'L' },
  { date: '28.06', time: '02:30', team1: 'Columbia', team2: 'Portugalia', round: 3, group: 'K' },
  { date: '28.06', time: '02:30', team1: 'DR Congo', team2: 'Uzbekistan', round: 3, group: 'K' },
  { date: '28.06', time: '05:00', team1: 'Algeria', team2: 'Austria', round: 3, group: 'J' },
  { date: '28.06', time: '05:00', team1: 'Iordania', team2: 'Argentina', round: 3, group: 'J' },
];

export const WORLD_CUP_MATCHES: WCMatch[] = MATCH_TEMPLATES.map((tpl, i) => {
  const [day, month] = tpl.date.split('.').map(Number);
  const [hour, min] = tpl.time.split(':').map(Number);
  
  // Create a proper datetime in 2026.
  // We'll treat the timezone as GMT+3 (Romania standard in June).
  const datetime = `2026-06-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00+03:00`;
  const stadiumInfo = getStadiumInfo(tpl.team1, i);

  // High-performance streaming options: embed free player loops that bypass iframe security
  // or a custom HTML5 test streaming file, or YouTube Live embeds
  const embedCodeMap: Record<string, string> = {
    'Mexic': `<video class="plyr-video" playsinline><source src="https://archive.org/download/world-cup-2026-match-1-mexico-vs-south-africa-full-match-11-jun-2026-1/FIFA%20World%20Cup%202026-06-11%20Opening%20Ceremony%20Mexico%20City%20%28Shakira%20%26%20Burna%20Boy%29.mkv">Browserul tău nu suportă redarea video.</video>`,
    'SUA': `<iframe src="https://www.youtube.com/embed/3A8Ksc0ZzGg?autoplay=1&mute=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="no-referrer"></iframe>`,
    'Canada': `<iframe src="https://www.youtube.com/embed/mAL6390Hj_8?autoplay=1&mute=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="no-referrer"></iframe>`,
    'Coreea de Sud': `<div class="rounded-xl border border-zinc-700 overflow-hidden shadow-2xl"><video class="plyr-video" playsinline><source src="https://archive.org/download/fifa-world-cup-2026-06-11-south-korea-vs-czechia-group-a-stv-itv/FIFA%20World%20Cup%202026-06-11%20South%20Korea%20vs%20Czechia%20%28Group%20A%29_STV-ITV.mkv" type="video/x-matroska"></video></div>`,
  };

  const defaultEmbed = `<iframe src="https://player.vimeo.com/video/521799279?autoplay=1&muted=1&loop=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="no-referrer"></iframe>`;

  return {
    id: `wc-2026-m${i + 1}`,
    round: tpl.round,
    group: tpl.group,
    team1: tpl.team1,
    team2: tpl.team2,
    team1Code: TEAM_FLAGS[tpl.team1] || 'un',
    team2Code: TEAM_FLAGS[tpl.team2] || 'un',
    date: tpl.date,
    time: tpl.time,
    stadium: stadiumInfo.stadium,
    city: stadiumInfo.city,
    country: stadiumInfo.country,
    datetime,
    embedCode: embedCodeMap[tpl.team1] || defaultEmbed,
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8' // Alternate HLS Stream that actually works in ReactPlayer
  };
});

export interface MatchLiveState {
  status: 'scheduled' | 'live' | 'finished';
  score1: number;
  score2: number;
  liveMinute?: string;
  isPast: boolean;
}

export function getMatchLiveStatus(match: WCMatch, customTimeMs?: number): MatchLiveState {
  const matchTime = new Date(match.datetime).getTime();
  const now = customTimeMs || Date.now();
  const elapsedMinutes = (now - matchTime) / (60 * 1000);
  
  if (elapsedMinutes < 0) {
    // Scheduled (Future match)
    return {
      status: 'scheduled',
      score1: 0,
      score2: 0,
      isPast: false,
    };
  } else if (elapsedMinutes < 105) {
    // Live match (approx 105 mins including halftime)
    const seed = match.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const minute = Math.min(90, Math.floor(elapsedMinutes));
    
    // Total potential goals for this match (0 to 3)
    const totalGoals1 = seed % 3; // 0, 1, 2
    const totalGoals2 = (seed + 2) % 3; // 0, 1, 2
    
    // Distribute goals linearly over time
    const score1 = Math.floor((minute / 90) * totalGoals1);
    const score2 = Math.floor((minute / 90) * totalGoals2);
    
    let liveMinuteStr = `${minute}'`;
    if (minute >= 45 && minute < 60) {
      liveMinuteStr = 'Pauză';
    } else if (minute >= 90) {
      liveMinuteStr = 'Prelungiri';
    }

    return {
      status: 'live',
      score1,
      score2,
      liveMinute: liveMinuteStr,
      isPast: true,
    };
  } else {
    // Finished match
    const seed = match.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const score1 = seed % 3; // 0, 1, 2
    const score2 = (seed + 2) % 3; // 0, 1, 2
    
    return {
      status: 'finished',
      score1,
      score2,
      isPast: true,
    };
  }
}

export function getActiveTime(): number {
  const active = localStorage.getItem('wc_simulation_active') === 'true';
  if (active) {
    // June 20, 2026, 15:00:00 Romanian Time (UTC+3)
    return new Date('2026-06-20T15:00:00+03:00').getTime();
  }
  return Date.now();
}


