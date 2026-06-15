const fs = require('fs');

let fileStr = fs.readFileSync('src/pages/admin/WorldCupManager.tsx', 'utf8');

const translations = [
  ['Meciuri Cupă & Playeri Stream', 'Cup Matches & Stream Players'],
  ['Gestionează disponibilitatea Player 1, 2, 3 și actualizează în timp real codurile iFrame (embed) pentru transmisiunile live.', 'Manage availability of Player 1, 2, 3 and update iFrame embed codes for live streams in real-time.'],
  ['Selectează Meciul', 'Select Match'],
  ['Se încarcă meciurile...', 'Loading matches...'],
  ['Niciun meci.', 'No matches.'],
  ['Grup', 'Group'],
  ['Selecționează un meci pentru a-l edita.', 'Select a match to edit.'],
  ['Editare configurare', 'Edit Configuration'],
  ['Reîncărcare', 'Reload'],
  ['Se încarcă setările canelelor...', 'Loading channel settings...'],
  ['Fișierul este prea mare (>50MB). Te rugăm să-l încarci pe un serviciu de hosting video (YouTube/Vimeo) și să folosești link-ul direct.', 'File is too large (>50MB). Please upload it to a video hosting service (YouTube/Vimeo) and use the direct link.'],
  ['A apărut o eroare la încărcarea fișierului: ', 'An error occurred while uploading the file: '],
  ['Setări salvate cu succes. Vor reflecta imediat site-ului public.', 'Settings successfully saved. They will immediately reflect on the public site.'],
  ['Status Activ', 'Active Status'],
  ['Cod Iframe Embed Video (HTmL)', 'Video Iframe Embed Code (HTML)'],
  ['Dacă lăsați gol, se va folosi player-ul implicit...', 'If left empty, the default public match player will be used.'],
  ['Afișat în aplicație', 'Shown in app'],
  ['Dezactivat (Eroare player unavailable pe public)', 'Disabled (Unavailable player error shown publicly)'],
  ['Player Principal obligatoriu pentru toți.', 'Primary player required for all.'],
  ['Sursă alternativă pentru probleme tehnice.', 'Alternative source for technical issues.'],
  ['Salvează Setările', 'Save Settings'],
  ['Se salvează...', 'Saving...'],
  ['Setări Invalide', 'Invalid Settings'],
  ['Replay Meci', 'Match Replay'],
  ['Link Replay', 'Replay Link'],
  ['Încarcă Video', 'Upload Video'],
  ['Se încarcă...', 'Uploading...']
];

for (const [ro, en] of translations) {
  fileStr = fileStr.split(ro).join(en);
}

fs.writeFileSync('src/pages/admin/WorldCupManager.tsx', fileStr);
console.log('Translated WorldCupManager.tsx');
