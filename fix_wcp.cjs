const fs = require('fs');
let content = fs.readFileSync('src/pages/public/WorldCupPage.tsx', 'utf8');

const lr = [
  ['Urmărește în direct toate matchesle turneului final care are loc în Statele Unite ale Americii, Mexic și Canada. Transmisiuni live, statistici grupa, orele de difuzare și countdown complet.', 'Watch all tournament matches live taking place in the United States, Mexico, and Canada. Live streams, group statistics, broadcast times, and full countdown.'],
  ['Urmărește în direct toate', 'Watch all matches live'],
  ['Calificare majoră', 'Major Qualification'],
  ['matchesle', 'matches'],
  ['Runda', 'Round'],
  ['Meciuri Live & Program', 'Live Matches & Schedule'],
  ['Clasamente Grupe', 'Group Standings'],
  ['Toate Roundle', 'All Rounds'],
  ['Caută o țară, grupă sau oraș...', 'Search for a country, group or city...'],
  ['meciuri', 'matches'],
  ['Grupa', 'Group'],
  ['privesc acum', 'watching now'],
  ['vizite recente', 'recent views'],
  ['Meci detaliat', 'Match details'],
  ['Echipă', 'Team']
];

for (const [ro, en] of lr) {
  content = content.split(ro).join(en);
}

fs.writeFileSync('src/pages/public/WorldCupPage.tsx', content);

console.log('Fixed WorldCupPage.tsx');
