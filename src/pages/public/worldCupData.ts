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
  score1?: number;
  score2?: number;
  date: string; // format: "11.06"
  time: string; // format: "22:00"
  stadium: string;
  city: string;
  country: 'Mexico' | 'USA' | 'Canada';
  datetime: string; // ISO String for Countdown
  embedCode?: string;
  streamUrl?: string;
}

// Map coordinates for pinpoint styling depending on country
export const COUNTRY_STADIUMS: Record<string, { stadium: string; city: string; country: 'Mexico' | 'USA' | 'Canada'; x: number; y: number }> = {
  Mexic: { stadium: 'Mexico City Stadium (Estadio Azteca)', city: 'Ciudad de Mexico', country: 'Mexico', x: 52, y: 72 },
  SUA_LA: { stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', x: 22, y: 45 },
  SUA_NY: { stadium: 'MetLife Stadium', city: 'New York / New Jersey', country: 'USA', x: 82, y: 35 },
  SUA_MIA: { stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA', x: 74, y: 78 },
  SUA_ATL: { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA', x: 68, y: 55 },
  SUA_DAL: { stadium: 'AT&T Stadium', city: 'Dallas', country: 'USA', x: 48, y: 62 },
  Canada_VAN: { stadium: 'BC Place', city: 'Vancouver', country: 'Canada', x: 20, y: 15 },
  Canada_TOR: { stadium: 'BMO Field', city: 'Toronto', country: 'Canada', x: 76, y: 28 },
};

export const TEAM_FLAGS: Record<string, string> = {
  'Mexico': 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Czechia': 'cz',
  'Canada': 'ca',
  'Bosnia & Herzegovina': 'ba',
  'USA': 'us',
  'Paraguay': 'py',
  'Qatar': 'qa',
  'Switzerland': 'ch',
  'Brazil': 'br',
  'Morocco': 'ma',
  'Haiti': 'ht',
  'Scotland': 'gb',
  'Australia': 'au',
  'Turkey': 'tr',
  'Germany': 'de',
  'Curacao': 'cw',
  'Netherlands': 'nl',
  'Japan': 'jp',
  'Ivory Coast': 'ci',
  'Ecuador': 'ec',
  'Sweden': 'se',
  'Tunisia': 'tn',
  'Spain': 'es',
  'Cape Verde': 'cv',
  'Belgium': 'be',
  'Egypt': 'eg',
  'Saudi Arabia': 'sa',
  'Uruguay': 'uy',
  'Iran': 'ir',
  'New Zealand': 'nz',
  'France': 'fr',
  'Senegal': 'sn',
  'Iraq': 'iq',
  'Norway': 'no',
  'Argentina': 'ar',
  'Algeria': 'dz',
  'Austria': 'at',
  'Jordan': 'jo',
  'Portugal': 'pt',
  'DR Congo': 'cd',
  'England': 'gb',
  'Croatia': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa',
  'Uzbekistan': 'uz',
  'Colombia': 'co'
};

// Helper to determine stadium based on home team or rotation
function getStadiumInfo(team1: string, index: number) {
  if (team1 === 'Mexico') return COUNTRY_STADIUMS.Mexic;
  if (team1 === 'USA') return COUNTRY_STADIUMS.SUA_LA;
  if (team1 === 'Canada') return COUNTRY_STADIUMS.Canada_VAN;
  
  const rotationKeys = Object.keys(COUNTRY_STADIUMS);
  const info = COUNTRY_STADIUMS[rotationKeys[index % rotationKeys.length]];
  return info;
}



// Generate the full match list
const MATCH_TEMPLATES = [
  // --- ROUND 1 ---
  { date: '11.06', time: '22:00', team1: 'Mexico', team2: 'South Africa', score1: 2, score2: 0, round: 1, group: 'A' },
  { date: '12.06', time: '05:00', team1: 'South Korea', team2: 'Czechia', score1: 2, score2: 1, round: 1, group: 'A' },
  { date: '12.06', time: '22:00', team1: 'Canada', team2: 'Bosnia & Herzegovina', score1: 1, score2: 1, round: 1, group: 'B' },
  { date: '13.06', time: '04:00', team1: 'USA', team2: 'Paraguay', score1: 4, score2: 1, round: 1, group: 'C' },
  { date: '13.06', time: '22:00', team1: 'Qatar', team2: 'Switzerland', score1: 1, score2: 1, round: 1, group: 'B' },
  { date: '14.06', time: '01:00', team1: 'Brazil', team2: 'Morocco', score1: 1, score2: 1, round: 1, group: 'D' },
  { date: '14.06', time: '04:00', team1: 'Haiti', team2: 'Scotland', score1: 0, score2: 1, round: 1, group: 'D' },
  { date: '14.06', time: '07:00', team1: 'Australia', team2: 'Turkey', score1: 2, score2: 0, round: 1, group: 'C' },
  { date: '14.06', time: '20:00', team1: 'Germany', team2: 'Curacao', score1: 7, score2: 1, round: 1, group: 'E' },
  { date: '14.06', time: '23:00', team1: 'Netherlands', team2: 'Japan', score1: 2, score2: 2, round: 1, group: 'F' },
  { date: '15.06', time: '02:00', team1: 'Ivory Coast', team2: 'Ecuador', score1: 1, score2: 0, round: 1, group: 'E' },
  { date: '15.06', time: '05:00', team1: 'Sweden', team2: 'Tunisia', score1: 5, score2: 1, round: 1, group: 'F' },
  { date: '15.06', time: '19:00', team1: 'Spain', team2: 'Cape Verde', round: 1, group: 'G' },
  { date: '15.06', time: '22:00', team1: 'Belgium', team2: 'Egypt', round: 1, group: 'H' },
  { date: '16.06', time: '01:00', team1: 'Saudi Arabia', team2: 'Uruguay', round: 1, group: 'G' },
  { date: '16.06', time: '04:00', team1: 'Iran', team2: 'New Zealand', round: 1, group: 'H' },
  { date: '16.06', time: '22:00', team1: 'France', team2: 'Senegal', round: 1, group: 'I' },
  { date: '17.06', time: '01:00', team1: 'Iraq', team2: 'Norway', round: 1, group: 'I' },
  { date: '17.06', time: '04:00', team1: 'Argentina', team2: 'Algeria', round: 1, group: 'J' },
  { date: '17.06', time: '07:00', team1: 'Austria', team2: 'Jordan', round: 1, group: 'J' },
  { date: '17.06', time: '20:00', team1: 'Portugal', team2: 'DR Congo', round: 1, group: 'K' },
  { date: '17.06', time: '23:00', team1: 'England', team2: 'Croatia', round: 1, group: 'L' },
  { date: '18.06', time: '02:00', team1: 'Ghana', team2: 'Panama', round: 1, group: 'L' },
  { date: '18.06', time: '05:00', team1: 'Uzbekistan', team2: 'Colombia', round: 1, group: 'K' },

  // --- ROUND 2 ---
  { date: '18.06', time: '19:00', team1: 'Czechia', team2: 'South Africa', round: 2, group: 'A' },
  { date: '18.06', time: '22:00', team1: 'Switzerland', team2: 'Bosnia & Herzegovina', round: 2, group: 'B' },
  { date: '19.06', time: '01:00', team1: 'Canada', team2: 'Qatar', round: 2, group: 'B' },
  { date: '19.06', time: '04:00', team1: 'Mexico', team2: 'South Korea', round: 2, group: 'A' },
  { date: '19.06', time: '22:00', team1: 'USA', team2: 'Australia', round: 2, group: 'C' },
  { date: '20.06', time: '01:00', team1: 'Scotland', team2: 'Morocco', round: 2, group: 'D' },
  { date: '20.06', time: '03:30', team1: 'Brazil', team2: 'Haiti', round: 2, group: 'D' },
  { date: '20.06', time: '06:00', team1: 'Turkey', team2: 'Paraguay', round: 2, group: 'C' },
  { date: '20.06', time: '20:00', team1: 'Netherlands', team2: 'Sweden', round: 2, group: 'F' },
  { date: '20.06', time: '23:00', team1: 'Germany', team2: 'Ivory Coast', round: 2, group: 'E' },
  { date: '21.06', time: '03:00', team1: 'Ecuador', team2: 'Curacao', round: 2, group: 'E' },
  { date: '21.06', time: '05:00', team1: 'Tunisia', team2: 'Japan', round: 2, group: 'F' },
  { date: '21.06', time: '19:00', team1: 'Spain', team2: 'Saudi Arabia', round: 2, group: 'G' },
  { date: '21.06', time: '22:00', team1: 'Belgium', team2: 'Iran', round: 2, group: 'H' },
  { date: '22.06', time: '01:00', team1: 'Uruguay', team2: 'Cape Verde', round: 2, group: 'G' },
  { date: '22.06', time: '04:00', team1: 'New Zealand', team2: 'Egypt', round: 2, group: 'H' },
  { date: '22.06', time: '22:00', team1: 'France', team2: 'Iraq', round: 2, group: 'I' },
  { date: '23.06', time: '01:00', team1: 'Norway', team2: 'Senegal', round: 2, group: 'I' },
  { date: '23.06', time: '04:00', team1: 'Argentina', team2: 'Austria', round: 2, group: 'J' },
  { date: '23.06', time: '07:00', team1: 'Jordan', team2: 'Algeria', round: 2, group: 'J' },
  { date: '23.06', time: '20:00', team1: 'Portugal', team2: 'Uzbekistan', round: 2, group: 'K' },
  { date: '23.06', time: '23:00', team1: 'England', team2: 'Ghana', round: 2, group: 'L' },
  { date: '24.06', time: '02:00', team1: 'Panama', team2: 'Croatia', round: 2, group: 'L' },
  { date: '24.06', time: '05:00', team1: 'Colombia', team2: 'DR Congo', round: 2, group: 'K' },

  // --- ROUND 3 ---
  { date: '24.06', time: '22:00', team1: 'Bosnia & Herzegovina', team2: 'Qatar', round: 3, group: 'B' },
  { date: '24.06', time: '22:00', team1: 'Switzerland', team2: 'Canada', round: 3, group: 'B' },
  { date: '25.06', time: '01:00', team1: 'Morocco', team2: 'Haiti', round: 3, group: 'D' },
  { date: '25.06', time: '01:00', team1: 'Scotland', team2: 'Brazil', round: 3, group: 'D' },
  { date: '25.06', time: '04:00', team1: 'South Africa', team2: 'South Korea', round: 3, group: 'A' },
  { date: '25.06', time: '04:00', team1: 'Czechia', team2: 'Mexico', round: 3, group: 'A' },
  { date: '25.06', time: '23:00', team1: 'Curacao', team2: 'Ivory Coast', round: 3, group: 'E' },
  { date: '25.06', time: '23:00', team1: 'Ecuador', team2: 'Germany', round: 3, group: 'E' },
  { date: '26.06', time: '02:00', team1: 'Japan', team2: 'Sweden', round: 3, group: 'F' },
  { date: '26.06', time: '02:00', team1: 'Tunisia', team2: 'Netherlands', round: 3, group: 'F' },
  { date: '26.06', time: '05:00', team1: 'Paraguay', team2: 'Australia', round: 3, group: 'C' },
  { date: '26.06', time: '05:00', team1: 'Turkey', team2: 'USA', round: 3, group: 'C' },
  { date: '26.06', time: '22:00', team1: 'Norway', team2: 'France', round: 3, group: 'I' },
  { date: '26.06', time: '22:00', team1: 'Senegal', team2: 'Iraq', round: 3, group: 'I' },
  { date: '27.06', time: '03:00', team1: 'Cape Verde', team2: 'Saudi Arabia', round: 3, group: 'G' },
  { date: '27.06', time: '03:00', team1: 'Uruguay', team2: 'Spain', round: 3, group: 'G' },
  { date: '27.06', time: '06:00', team1: 'Egypt', team2: 'Iran', round: 3, group: 'H' },
  { date: '27.06', time: '06:00', team1: 'New Zealand', team2: 'Belgium', round: 3, group: 'H' },
  { date: '28.06', time: '00:00', team1: 'Croatia', team2: 'Ghana', round: 3, group: 'L' },
  { date: '28.06', time: '00:00', team1: 'Panama', team2: 'England', round: 3, group: 'L' },
  { date: '28.06', time: '02:30', team1: 'Colombia', team2: 'Portugal', round: 3, group: 'K' },
  { date: '28.06', time: '02:30', team1: 'DR Congo', team2: 'Uzbekistan', round: 3, group: 'K' },
  { date: '28.06', time: '05:00', team1: 'Algeria', team2: 'Austria', round: 3, group: 'J' },
  { date: '28.06', time: '05:00', team1: 'Jordan', team2: 'Argentina', round: 3, group: 'J' },
];

export const WORLD_CUP_MATCHES: WCMatch[] = MATCH_TEMPLATES.map((tpl, i) => {
  const [day, month] = tpl.date.split('.').map(Number);
  const [hour, min] = tpl.time.split(':').map(Number);
  
  const datetime = `2026-06-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00+03:00`;
  const stadiumInfo = getStadiumInfo(tpl.team1, i);

  const embedCodeMap: Record<string, string> = {
    'Mexico': `<video class="plyr-video" playsinline><source src="https://archive.org/download/world-cup-2026-match-1-mexico-vs-south-africa-full-match-11-jun-2026-1/FIFA%20World%20Cup%202026-06-11%20Opening%20Ceremony%20Mexico%20City%20%28Shakira%20%26%20Burna%20Boy%29.mkv">Your browser does not support video playback.</video>`,
    'USA': `<iframe src="https://www.youtube.com/embed/3A8Ksc0ZzGg?autoplay=1&mute=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`,
    'Canada': `<iframe src="https://www.youtube.com/embed/mAL6390Hj_8?autoplay=1&mute=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`,
    'South Korea': `<video class="plyr-video" playsinline><source src="https://archive.org/download/fifa-world-cup-2026-06-11-south-korea-vs-czechia-group-a-stv-itv/FIFA%20World%20Cup%202026-06-11%20South%20Korea%20vs%20Czechia%20%28Group%20A%29_STV-ITV.mkv" type="video/x-matroska"></video>`,
  };

  const defaultEmbed = `<iframe src="https://player.vimeo.com/video/521799279?autoplay=1&muted=1&loop=1" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

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
    score1: (tpl as any).score1,
    score2: (tpl as any).score2,
    stadium: stadiumInfo.stadium,
    city: stadiumInfo.city,
    country: stadiumInfo.country,
    datetime,
    embedCode: embedCodeMap[tpl.team1] || defaultEmbed,
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8'
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
      score1: match.score1 ?? 0,
      score2: match.score2 ?? 0,
      isPast: false,
    };
  } else if (elapsedMinutes < 105) {
    // Live match (approx 105 mins including halftime)
    const seed = match.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const minute = Math.min(90, Math.floor(elapsedMinutes));
    
    let liveMinuteStr = `${minute}'`;
    if (minute >= 45 && minute < 60) {
      liveMinuteStr = 'Half Time';
    } else if (minute >= 90) {
      liveMinuteStr = 'Extra Time';
    }

    // Return 0-0 for all matches as we don't have real live scores
    return {
      status: 'live',
      score1: match.score1 ?? 0,
      score2: match.score2 ?? 0,
      liveMinute: liveMinuteStr,
      isPast: true,
    };
  } else {
    // Finished match
    return {
      status: 'finished',
      score1: match.score1 ?? 0,
      score2: match.score2 ?? 0,
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


