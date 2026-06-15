import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const domain = 'https://www.programetv.online';

async function generateSeoFiles() {
  console.log('--- STARTING STATIC SEO BUILD GENERATION ---');
  
  // Make sure public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`Created public directory: ${publicDir}`);
  }

  // Load config
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: firebase-applet-config.json not found. Aborting SEO gen.');
    process.exit(1);
  }

  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  console.log(`Connected to Firebase project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId}`);

  // 1. GENERATE ROBOTS.TXT
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /adminadmin/
Disallow: /api/

Sitemap: ${domain}/sitemap.xml
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
  console.log('Successfully wrote robots.txt');

  // 2. FETCH FIREBASE DATA
  let programsList: string[] = [];
  let articlesList: { title: string; slug: string; description: string; date: string }[] = [];
  let showsList: string[] = [];

  try {
    const snapshotPrograms = await getDocs(collection(db, 'programs'));
    programsList = snapshotPrograms.docs.map(doc => doc.id);
    console.log(`Fetched ${programsList.length} live channels.`);
  } catch (e: any) {
    console.error('Failed to fetch programs:', e.message);
  }

  try {
    const snapshotArticles = await getDocs(collection(db, 'articles'));
    articlesList = snapshotArticles.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        title: data.title || 'Stiri',
        slug: data.slug || docSnap.id,
        description: data.content ? data.content.substring(0, 160).replace(/<[^>]*>/g, '') : '',
        date: data.createdAt ? new Date(data.createdAt).toUTCString() : new Date().toUTCString()
      };
    });
    console.log(`Fetched ${articlesList.length} articles.`);
  } catch (e: any) {
    console.error('Failed to fetch articles:', e.message);
  }

  try {
    const snapshotShows = await getDocs(collection(db, 'shows'));
    showsList = snapshotShows.docs.map(docSnap => {
      const data = docSnap.data();
      return data.slug || docSnap.id;
    });
    console.log(`Fetched ${showsList.length} shows.`);
  } catch (e: any) {
    console.error('Failed to fetch shows:', e.message);
  }

  // 3. GENERATE SITEMAP.XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  const staticPages = [
    '', 
    '/news', 
    '/shows', 
    '/schedule', 
    '/search', 
    '/world-cup',
    '/donations',
    '/profile'
  ];
  for (const p of staticPages) {
    xml += `  <url>\n    <loc>${domain}${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Legal Pages
  const legalPages = [
    '/legal',
    '/privacy-policy',
    '/terms-of-service',
    '/dmca',
    '/copyright',
    '/cookie-policy',
    '/disclaimer',
    '/legal-contact',
    '/delete-my-data',
    '/accessibility'
  ];
  for (const p of legalPages) {
    xml += `  <url>\n    <loc>${domain}${p}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
  }

  // World Cup matches (Matches 1 to 48)
  for (let i = 1; i <= 48; i++) {
    xml += `  <url>\n    <loc>${domain}/world-cup/wc-2026-m${i}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Dynamic live channels
  for (const id of programsList) {
    xml += `  <url>\n    <loc>${domain}/play/${id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }

  // Dynamic news articles (recent first)
  for (const art of articlesList) {
    xml += `  <url>\n    <loc>${domain}/news/${art.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  // Dynamic shows
  for (const slug of showsList) {
    xml += `  <url>\n    <loc>${domain}/shows/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('Successfully wrote sitemap.xml');

  // 4. GENERATE RSS.XML (Public RSS Feed)
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  rss += `<channel>\n`;
  rss += `  <title>Flux Știri TV Românești – programetv.online</title>\n`;
  rss += `  <link>${domain}</link>\n`;
  rss += `  <description>Cele mai noi articole, noutăți despre posturile tale TV preferate, recenzii și actualități media din România.</description>\n`;
  rss += `  <language>ro</language>\n`;
  rss += `  <atom:link href="${domain}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  // Sort articles or take up to 20 for feed
  const rssArticles = articlesList.slice(0, 20);
  for (const art of rssArticles) {
    rss += `  <item>\n`;
    rss += `    <title><![CDATA[${art.title}]]></title>\n`;
    rss += `    <link>${domain}/news/${art.slug}</link>\n`;
    rss += `    <guid isPermaLink="true">${domain}/news/${art.slug}</guid>\n`;
    rss += `    <description><![CDATA[${art.description}]]></description>\n`;
    rss += `    <pubDate>${art.date}</pubDate>\n`;
    rss += `  </item>\n`;
  }

  rss += `</channel>\n`;
  rss += `</rss>\n`;
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss);
  console.log('Successfully wrote rss.xml');
  
  console.log('--- STATIC SEO BUILD GENERATION COMPLETE OVER 100% ---');
  process.exit(0);
}

generateSeoFiles().catch(err => {
  console.error('Critical failure in SEO files builder:', err);
  process.exit(1);
});
