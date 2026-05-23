import * as cheerio from 'cheerio';
import slugify from 'slugify';
import { getDb } from './firebaseAdmin.js';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

export async function runArticleScraper(options?: { targetUrl?: string; force?: boolean }) {
  const db = getDb();
  if (!db) return { success: false, message: 'DB not initialized' };

  let targetUrl = options?.targetUrl || '';
  let active = options?.force ? true : false;

  // Read settings from Settings collection if not overridden
  if (!targetUrl || !options?.force) {
    try {
      const qSettings = query(collection(db, 'settings'));
      const settingsDocs = await getDocs(qSettings);
      settingsDocs.forEach(d => {
        if (d.id === 'scraper') {
          if (!targetUrl) targetUrl = d.data().targetUrl;
          if (!options?.force) active = d.data().active;
        }
      });
    } catch (e: any) {
      console.error('Error fetching settings for scraper:', e.message);
    }
  }

  if (options?.force) {
    active = true;
  }

  if (!active || !targetUrl) {
    return { success: false, message: 'Scraper disabled or URL not set in settings/scraper' };
  }

  console.log('Fetching', targetUrl);
  let $;
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    const html = await response.text();
    $ = cheerio.load(html);
  } catch (err: any) {
    console.error('Error fetching source', err.message);
    return { success: false, message: `Eroare la accesarea URL Sursă: ${err.message}` };
  }

  // Define generic selectors for articles
  const articleSelector = 'article, .post, .article, .item-list, .blog-post, .news-item';
  const titleSelector = 'h2, h3, h1, .title, .post-title, .entry-title';
  const imgSelector = 'img';
  const linkSelector = 'a';
  
  const articlesFound: any[] = [];
  
  // Fetch existing categories to select a valid Category ID
  let defaultCategoryId = 'emisiuni';
  try {
    const qCats = query(collection(db, 'categories'));
    const catDocs = await getDocs(qCats);
    if (!catDocs.empty) {
      defaultCategoryId = catDocs.docs[0].id; // Use first category
    } else {
      // Create 'Noutăți' category if none exist
      const catRef = doc(collection(db, 'categories'));
      const catData = { name: 'Noutăți', slug: 'noutati' };
      await setDoc(catRef, catData);
      defaultCategoryId = catRef.id;
    }
  } catch (err) {
    console.warn('Could not list/create categories, fallback to generic ID:', err);
  }

  $(articleSelector).each((i, el) => {
    const titleEl = $(el).find(titleSelector).first();
    const title = titleEl.text().trim();
    if (!title || title.length < 5) return;
    
    // Find link inside title or article container
    let link = titleEl.find('a').attr('href') || titleEl.attr('href') || $(el).find(linkSelector).attr('href');
    if (!link) return;

    if (link && !link.startsWith('http')) {
      try {
        const urlObj = new URL(targetUrl!);
        link = urlObj.origin + (link.startsWith('/') ? '' : '/') + link;
      } catch (err) {
        return;
      }
    }

    // Filter link to match source domain to prevent grabbing social links
    try {
      const srcUrlObj = new URL(targetUrl!);
      const destUrlObj = new URL(link);
      if (srcUrlObj.hostname !== destUrlObj.hostname) {
        return; // Skip outbound or advertisements
      }
    } catch (e) {
      return;
    }

    // Find image, searching common lazy loads
    const imgEl = $(el).find(imgSelector).first();
    let img = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
    if (img.startsWith('//')) {
      img = 'https:' + img;
    }

    articlesFound.push({ 
      title, 
      link, 
      img: img || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80' 
    });
  });

  // Limit imports to prevent spikes
  const processLimit = 15;
  const articlesToProcess = articlesFound.slice(0, processLimit);
  let importedCount = 0;

  for (const item of articlesToProcess) {
    if (!item.link) continue;
    
    // Check duplicates
    const linkQuery = query(collection(db, 'articles'), where('originalLink', '==', item.link));
    const dupCheck = await getDocs(linkQuery);
    if (!dupCheck.empty) continue; // Skip existing

    // Generate unique Romanian slug
    let rawSlug = slugify(item.title, { lower: true, strict: true, locale: 'ro' });
    let existingSlug = await getDocs(query(collection(db, 'articles'), where('slug', '==', rawSlug)));
    if (!existingSlug.empty) {
      rawSlug = rawSlug + '-' + Math.floor(Math.random() * 1000);
    }

    try {
      // Small pause to be polite
      await new Promise(r => setTimeout(r, 800));
      
      const detailRes = await fetch(item.link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        }
      });
      if (!detailRes.ok) continue;

      const detailHtml = await detailRes.text();
      const $detail = cheerio.load(detailHtml);

      // Extract high quality HTML content
      let content = '';
      const contentEl = $detail('.entry-content, .post-content, .article-content, .post-entry, .entry, .single-content, .article-body, [itemprop="articleBody"]');
      if (contentEl.length > 0) {
        content = contentEl.first().html() || '';
      } else {
        const articleEl = $detail('article');
        if (articleEl.length > 0) {
          content = articleEl.first().html() || '';
        }
      }

      // Clean typical unnecessary elements
      if (content) {
        const $content = cheerio.load(content);
        $content('script, style, iframe, .sharedaddy, .wpcnt, .jp-relatedposts, .social-sharing, .ads, .advertisement').remove();
        content = $content.html() || '';
      }

      if (!content || content.trim().length < 50) {
        content = `<p class="lead">${item.title}</p><p>Citiți întregul articol pe site-ul oficial accesând link-ul de mai jos.</p><div class="my-4"><a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">Vezi articolul original &rarr;</a></div>`;
      }

      // Fetch author
      let author = $detail('.author, .post-author, [rel="author"], .entry-author, .meta-author').text().trim();
      if (!author) {
        author = $detail('[itemprop="author"] .name, [itemprop="author"]').text().trim();
      }
      if (author) {
        author = author.replace(/^(de|scris de|by)\s+/i, '').trim();
        author = author.split('\n')[0].trim();
      }
      author = author || 'Auto Scraper';
      
      const newArticle = {
        title: item.title,
        slug: rawSlug,
        content: content,
        coverImage: item.img,
        thumbnail: item.img,
        banner: item.img,
        categoryId: defaultCategoryId,
        author: author,
        originalLink: item.link,
        status: 'published', // Correct format for frontend matching 'published'
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

  return { 
    success: true, 
    count: importedCount, 
    message: importedCount > 0 
      ? `Succes: S-au importat ${importedCount} articole noi.` 
      : 'Sursă analizată: Toate articolele găsite sunt deja importate sau nu s-a putut descărca conținutul.' 
  };
}
