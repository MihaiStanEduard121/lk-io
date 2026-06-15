const fs = require('fs');
let content = fs.readFileSync('src/pages/public/worldCupData.ts', 'utf8');

const dict = {
  'Mexic': 'Mexico',
  'Africa de Sud': 'South Africa',
  'Coreea de Sud': 'South Korea',
  'Cehia': 'Czechia',
  'Canada': 'Canada',
  'Bosnia și Herțegovina': 'Bosnia & Herzegovina',
  'SUA': 'USA',
  'Paraguay': 'Paraguay',
  'Qatar': 'Qatar',
  'Elveția': 'Switzerland',
  'Brazilia': 'Brazil',
  'Maroc': 'Morocco',
  'Haiti': 'Haiti',
  'Scoția': 'Scotland',
  'Australia': 'Australia',
  'Turcia': 'Turkey',
  'Germania': 'Germany',
  'Curacao': 'Curacao',
  'Țările de Jos': 'Netherlands',
  'Japonia': 'Japan',
  'Coasta de Fildeș': 'Ivory Coast',
  'Ecuador': 'Ecuador',
  'Suedia': 'Sweden',
  'Tunisia': 'Tunisia',
  'Spania': 'Spain',
  'Capul Verde': 'Cape Verde',
  'Belgia': 'Belgium',
  'Egipt': 'Egypt',
  'Arabia Saudită': 'Saudi Arabia',
  'Uruguay': 'Uruguay',
  'Iran': 'Iran',
  'Noua Zeelandă': 'New Zealand',
  'Franța': 'France',
  'Senegal': 'Senegal',
  'Irak': 'Iraq',
  'Norvegia': 'Norway',
  'Argentina': 'Argentina',
  'Algeria': 'Algeria',
  'Austria': 'Austria',
  'Iordania': 'Jordan',
  'Portugalia': 'Portugal',
  'DR Congo': 'DR Congo',
  'Anglia': 'England',
  'Croația': 'Croatia',
  'Ghana': 'Ghana',
  'Panama': 'Panama',
  'Uzbekistan': 'Uzbekistan',
  'Columbia': 'Colombia'
};

content = content.replace("liveMinuteStr = 'Pauză';", "liveMinuteStr = 'Half-time';");
content = content.replace("liveMinuteStr = 'Prelungiri';", "liveMinuteStr = 'Extra time';");
content = content.replace("Browserul tău nu suportă redarea video.", "Your browser does not support video playback.");
content = content.replace(/[']Mexic['] \| [']SUA['] \| [']Canada[']/g, "'Mexico' | 'USA' | 'Canada'");

for (const [ro, en] of Object.entries(dict)) {
  content = content.split(`'${ro}'`).join(`'${en}'`);
}

fs.writeFileSync('src/pages/public/worldCupData.ts', content);

// Also let's translate WorldCupPage.tsx
let wcp = fs.readFileSync('src/pages/public/WorldCupPage.tsx', 'utf8');

const wcpTranslations = [
  ['Se încarcă meciurile...', 'Loading matches...'],
  ['Nu sunt meciuri disponibile.', 'No matches available.'],
  ['Meciuri Live & Program', 'Live Matches & Schedule'],
  ['Clasamente Grupe', 'Group Standings'],
  ['Toate Rundele', 'All Rounds'],
  ['Runda 1', 'Round 1'],
  ['Runda 2', 'Round 2'],
  ['Runda 3', 'Round 3'],
  ['Caută o țară, grupă sau oraș...', 'Search for a country, group or city...'],
  ['meciuri', 'matches'],
  ['Grupa ', 'Group '],
  ['privesc acum', 'watching now'],
  ['vizite recente', 'recent views'],
  ['Meci detaliat', 'Match details'],
  ['Echipă', 'Team'],
  ['Cupa Mondială 2026', 'World Cup 2026'],
  ['Urmărește în direct toate meciurile turneului final care are loc în Statele Unite ale Americii, Mexic și Canada. Transmisiuni live, statistici grupa, orele de difuzare și countdown complet.', 'Watch all tournament matches live, taking place in the United States, Mexico, and Canada. Live streams, group statistics, broadcast times, and full countdown.']
];

for (const [ro, en] of wcpTranslations) {
  wcp = wcp.split(ro).join(en);
}

fs.writeFileSync('src/pages/public/WorldCupPage.tsx', wcp);


// And WorldCupMatchDetailPage.tsx
let dpage = fs.readFileSync('src/pages/public/WorldCupMatchDetailPage.tsx', 'utf8');

const dpTranslations = [
  ['Se încarcă meciul...', 'Loading match...'],
  ['Se încarcă detaliile meciului...', 'Loading match details...'],
  ['Înapoi la Cupa Mondială', 'Back to World Cup'],
  ['Meciuri Următoare:', 'Upcoming Matches:'],
  ['Toate Meciurile Cupa Mondială', 'All World Cup Matches'],
  ['Spectatori în Direct', 'Live Viewers'],
  ['Vizionare Activă', 'Active Viewing'],
  ['Urmărit de cititori', 'Watched by readers'],
  ["Meci Live", "Live Match"],
  ["Meci Încheiat", "Finished Match"],
  ['Transmisiune Live Player', 'Live Stream Player'],
  ['Statistici & Predicții', 'Stats & Predictions'],
  ['Echipe Probabile', 'Probable Lineups'],
  ['Semnal indisponibil momentan', 'Signal currently unavailable'],
  ['Acest player nu are un cod de stream configurat în panoul de administrare.', 'This player does not have a stream code configured in the admin panel.'],
  ['PLAYER INDISPONIBIL', 'PLAYER UNAVAILABLE'],
  ['Acest player a fost dezactivat de administrator. Vă rugăm să alegeți o altă sursă disponibilă (Player 1, 2 sau 3) de mai jos.', 'This player has been disabled by the administrator. Please choose another available source (Player 1, 2, or 3) below.'],
  ['Așteptare', 'Waiting'],
  ['Transmisiune încorporată indisponibilă momentan', 'Embedded broadcast currently unavailable'],
  ['Player-ul TV securizat se va activa automat la începerea oficială a jocului', 'The secure TV player will activate automatically when the game officially starts'],
  ['la ora', 'at'],
  ['Canale de Redare (Surse alternative)', 'Playback Channels (Alternative Sources)'],
  ['Dacă o sursă are întreruperi, vă rugăm să selectați un alt player din listă.', 'If a source has interruptions, please select another player from the list.'],
  ['Indisponibil', 'Unavailable'],
  ['Predicții Comunitate: Cine va câștiga?', 'Community Predictions: Who will win?'],
  ['Egalitate', 'Draw'],
  ['Egal', 'Draw'],
  ['Mulțumim pentru vot! Votul tău a fost prelucrat.', 'Thank you for voting! Your vote has been processed.'],
  ['Meciuri Directe (H2H)', 'Head-to-Head (H2H)'],
  ['Cupa Mondială 2022', 'World Cup 2022'],
  ['Amical Internațional 2024', 'International Friendly 2024'],
  ['Browser-ul tău nu suportă redarea video.', 'Your browser does not support video playback.'],
  ['Replay-ul meciului nu este încă disponibil.', 'Match replay is not yet available.'],
  ['Chat Suporteri', 'Supporter Chat'],
  ['Anonim', 'Anonymous'],
  ['Suporter_Nou', 'New_Supporter'],
  ['Suporter', 'Supporter'],
  ['Trimite un comentariu...', 'Send a comment...'],
  ['Trimiți ca:', 'Sending as:'],
  ['Schimbă Poreclă', 'Change Nickname'],
  ['Introduceți porecla personalizată pentru chat:', 'Enter custom chat nickname:'],
  ['Grupa ', 'Group '],
  ["Meci 'Live' : 'Încheiat'", "Match 'Live' : 'Finished'"],
  ["liveMinuteStr = 'Pauză';", "liveMinuteStr = 'Half-time';"],
  ["liveMinuteStr = 'Prelungiri';", "liveMinuteStr = 'Extra time';"],
  ["FINAL", "FINAL"],
  ["online", "online"]
];

for (const [ro, en] of dpTranslations) {
  dpage = dpage.split(ro).join(en);
}
// Special case for match ternary
dpage = dpage.replace("Meci {liveState.status === 'live' ? 'Live' : 'Încheiat'}", "Match {liveState.status === 'live' ? 'Live' : 'Finished'}");

fs.writeFileSync('src/pages/public/WorldCupMatchDetailPage.tsx', dpage);

console.log("Translation applied.");
