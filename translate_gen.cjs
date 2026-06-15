const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ArticleGenerator.tsx', 'utf8');

const tlds = [
  ['🔥 Unde vedem live', '🔥 Where to watch live'],
  ['la Cupa Mondială 2026? Avanpremieră, echipe probabile și ponturi bune', 'at the 2026 World Cup? Preview, probable lineups and good tips'],
  ['🏆 Cupa Mondială 2026: Blockbuster-ul Zilei între', '🏆 2026 World Cup: Match of the Day between'],
  ['Spectacolul fotbalistic de pe planetă atinge cote maxime la Cupa Mondială FIFA 2026, iar confruntarea epică din Grupa ', 'The football spectacle reaches new heights at the 2026 FIFA World Cup, and the epic Group '],
  ['dintre super-puterile', 'clash between superpowers'],
  ['se anunță a fi un adevărat roller-coaster de emoții!', 'promises to be a true roller-coaster of emotions!'],
  ['Arena de clasă mondială', 'The world-class arena'],
  ['din orașul gazdă', 'in host city'],
  ['va găzdui un meci crucial pentru soarta calificării în optimi.', 'will host a crucial match for the qualification.'],
  ['Cuvinte cheie de interes major:', 'High interest keywords:'],
  ['deținători drepturi, stream video gratis fotbal live comentat română, ponturi fotbal gratis', 'broadcasting rights, free live stream video football commentary, free football tips'],
  ['meciuri online gratis, program TV transmisiuni sportive.', 'free online matches, sports broadcast TV schedule.'],
  ['Tensiunile au atins cote stratosferice pe arena', 'Tensions have reached stratospheric levels at the arena'],
  ['În **minutul ', 'In the **minute '],
  ['al meciului de la Cupa Mondială 2026, tabela de marcaj s-a schimbat spectaculos în favoarea selecționatei din', 'of the 2026 World Cup match, the scoreboard spectacularly changed in favor of'],
  ['grație unei sclipiri de geniu semnate de', 'thanks to a stroke of genius by'],
  ['⚔️ A Început Bătălia!', '⚔️ The Battle Has Begun!'],
  ['în Direct la Cupa Mondială 2026', 'Live at the 2026 World Cup'],
  ['🏁 Fluier Final! Meci istoric la Cupa Mondială:', '🏁 Final Whistle! Historic World Cup match:'],
  ['Vezi rezumatul complet și omul meciului', 'See the full summary and man of the match'],
  ['Urmărit de ', 'Watched by '],
  ['cititori', 'readers']
];

for (const [ro, en] of tlds) {
  content = content.split(ro).join(en);
}

fs.writeFileSync('src/pages/admin/ArticleGenerator.tsx', content);

// And we can also fix worldCupData.ts liveMinuteStr to Extra Time not "Extra time"
let data = fs.readFileSync('src/pages/public/worldCupData.ts', 'utf8');
data = data.split("Extra time").join("Extra Time");
data = data.split("Half-time").join("Half Time");
fs.writeFileSync('src/pages/public/worldCupData.ts', data);


