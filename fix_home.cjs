const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Home.tsx', 'utf8');

const lr = [
  ['Urmărește cele mai populare transmisiuni, meciuri și emisiuni live într-un singur loc.', 'Watch the most popular live streams, matches, and shows in one place.'],
  ['Urmărește acum', 'Watch now'],
  ['🏆 RECOMANDAT • FIFA CUPA MONDIALĂ 2026', '🏆 RECOMMENDED • FIFA WORLD CUP 2026'],
  ['vizualizări', 'views'],
  ['Selecția Editorului', "Editor's Pick"],
  ['Cupa Mondială', 'World Cup']
];

for (const [ro, en] of lr) {
  content = content.split(ro).join(en);
}

fs.writeFileSync('src/pages/public/Home.tsx', content);

console.log('Fixed Home.tsx');
