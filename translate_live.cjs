const fs = require('fs');
let content = fs.readFileSync('src/server/api/liveScoresRoutes.ts', 'utf8');

const lr = [
  ['Cheia GEMINI_API_KEY lipsește. Este necesară pentru generarea articolului.', 'GEMINI_API_KEY is missing. It is required for article generation.'],
  ['Gol detectat:', 'Goal detected:'],
  ['Ești un jurnalist sportiv. S-a marcat un gol în meciul live dintre', 'You are a sports journalist. A goal has been scored in the live match between'],
  ['și', 'and'],
  ['Scorul curent este', 'The current score is'],
  ['Minutul:', 'Minute:'],
  ['Scrie un articol scurt de breaking news foarte captivant, de maxim 200 cuvinte, detaliind impactul acestui scor. Scrie direct, pe un ton alert, fără alte introduceri. Limba română.', 'Write a short highly engaging breaking news article of max 200 words detailing the impact of this score. Write directly, in an alert tone, without introductions. English language.'],
  ['GOOOOL! ', 'GOOAL! '],
  ['Scorul ajunge la', 'The score reaches'],
  ['în minutul', 'in minute'],
  ['Sincronizare ESPN completă. Articole generate:', 'ESPN Sync complete. Articles generated:'],
  ['Eroare la sincronizarea scorurilor live ESPN.', 'Error syncing ESPN live scores.']
];

for (const [ro, en] of lr) {
  content = content.split(ro).join(en);
}

fs.writeFileSync('src/server/api/liveScoresRoutes.ts', content);

console.log('Done live scores');
