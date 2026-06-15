const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Home.tsx', 'utf8');

const translations = [
  ['Meciuri Recomandate în Direct', 'Recommended Live Matches'],
  ['Program & Clasamente complet', 'Full Schedule & Standings'],
  ['Se încarcă meciurile recomandate...', 'Loading recommended matches...'],
  ['Grupa ', 'Group '],
  ['spectatori', 'viewers'],
  ['Ultimele Știri', 'Latest News'],
  ['Vezi toate știrile', 'View all news'],
  ['Emisiuni & Podcasturi', 'Shows & Podcasts'],
  ['Vezi toate emisiunile', 'View all shows'],
  ['Urmărește-ne', 'Follow us'],
  ['Vezi programul complet', 'View full schedule'],
  ['Acum în Direct', 'Live Now'],
  ['Următoarea Emisiune', 'Next Show'],
  ['Toate Drepturile Rezervate', 'All Rights Reserved'],
  ['Știri Recente', 'Recent News'],
  ['Acasă', 'Home'],
  ['Program', 'Schedule'],
  ['Știri', 'News'],
  ['Emisiuni', 'Shows'],
  ['FINAL', 'FINAL'],
  ['Emise Live', 'Live Shows'],
  ['Termeni și Condiții', 'Terms & Conditions'],
  ['Despre Noi', 'About Us'],
];

for (const [ro, en] of translations) {
  content = content.split(ro).join(en);
}

fs.writeFileSync('src/pages/public/Home.tsx', content);
console.log('Translated Home.tsx');
