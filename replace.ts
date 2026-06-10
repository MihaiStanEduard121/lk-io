import fs from 'fs';

let content = fs.readFileSync('src/pages/public/LegalPage.tsx', 'utf8');
content = content.replace(/Portal TV România/g, 'programetv.online');
content = content.replace(/Portal TV/g, 'programetv.online');
fs.writeFileSync('src/pages/public/LegalPage.tsx', content);

let layout = fs.readFileSync('src/components/layout/PublicLayout.tsx', 'utf8');
layout = layout.replace(/Portal TV /g, 'programetv.online ');
fs.writeFileSync('src/components/layout/PublicLayout.tsx', layout);
