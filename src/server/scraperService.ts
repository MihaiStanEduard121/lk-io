import * as cheerio from 'cheerio';
import slugify from 'slugify';
import { getDb } from './firebaseAdmin.js';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

export async function runArticleScraper() {
  const db = getDb();
  if (!db) return { success: false, message: 'DB not initialized' };

  // Fetch settings from Settings collection
  const qSettings = query(collection(db, 'settings'));
  const settingsDocs = await getDocs(qSettings);
  let targetUrl = '';
  let active = false;

  settingsDocs.forEach(d => {
    if (d.id === 'scraper') {
      targetUrl = d.data().targetUrl;
      active = d.data().active;
    }
  });

  if (!active || !targetUrl) {
    return { success: false, message: 'Scraper disabled or URL not set in settings/scraper' };
  }

  console.log('Fetching', targetUrl);
  let $;
  try {
    const response = await fetch(targetUrl);
    const html = await response.text();
    $ = cheerio.load(html);
  } catch (err: any) {
    console.error('Error fetching source', err.message);
    return { success: false, message: err.message };
  }

  // Define generic selectors (the user can customize later)
  const articleSelector = 'article, .post, .article, .item-list';
  const titleSelector = 'h2, h3, .title, .post-title';
  const imgSelector = 'img';
  const linkSelector = 'a';
  
  const articlesFound: any[] = [];
  
  $(articleSelector).each((i, el) => {
    const title = $(el).find(titleSelector).text().trim();
    if (!title) return;
    
    let link = $(el).find(linkSelector).attr('href');
    if (link && !link.startsWith('http')) {
      const urlObj = new URL(targetUrl!);
      link = urlObj.origin + (link.startsWith('/') ? '' : '/') + link;
    }

    const img = $(el).find(imgSelector).attr('src') || '';
    
    // We can fetch the detail page here if we want full content, but for now just scrape summary content, or attempt to fetch detail page
    articlesFound.push({ title, link, img: img.startsWith('//') ? 'https:' + img : img });
  });

  let importedCount = 0;
  for (const item of articlesFound) {
    // Attempt fetching detail page
    if (!item.link) continue;
    
    // Check duplicate
    const linkQuery = query(collection(db, 'articles'), where('originalLink', '==', item.link));
    const dupCheck = await getDocs(linkQuery);
    if (!dupCheck.empty) continue; // Skip existing

    // Generate slug
    let rawSlug = slugify(item.title, { lower: true, strict: true, locale: 'ro' });
    let existingSlug = await getDocs(query(collection(db, 'articles'), where('slug', '==', rawSlug)));
    if (!existingSlug.empty) {
      rawSlug = rawSlug + '-' + Math.floor(Math.random()*1000);
    }

    try {
      // Small delay to prevent rate limit
      await new Promise(r => setTimeout(r, 1000));
      
      const detailRes = await fetch(item.link);
      const detailHtml = await detailRes.text();
      const $detail = cheerio.load(detailHtml);

      // Try to find content
      const content = $detail('.entry-content, .post-content, .article-content, article').html() || `<p>${item.title}</p>`;
      const author = $detail('.author, .post-author, [rel="author"]').text().trim() || 'Auto Scraper';
      
      const newArticle = {
        title: item.title,
        slug: rawSlug,
        content: content,
        thumbnail: item.img || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80',
        banner: item.img || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80',
        categoryId: 'emisiuni', // Default
        author: author,
        originalLink: item.link,
        status: 'publish', // or draft 
        views: 0,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const ref = doc(collection(db, 'articles'));
      await setDoc(ref, newArticle);
      importedCount++;
      console.log('Imported:', item.title);

    } catch (e: any) {
      console.error('Error fetching detail page', item.link, e.message);
    }
  }

  return { success: true, count: importedCount, message: `Imported ${importedCount} articles.` };
}
