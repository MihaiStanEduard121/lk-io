import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getExpressApp } from './src/server/expressApp.js';
import { startCronJobs } from './src/server/cron.js';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getDb } from './src/server/firebaseAdmin.js';

async function startServer() {
  const app = getExpressApp();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', async (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        return res.sendStatus(404);
      }

      try {
        let html = fs.readFileSync(indexPath, 'utf8');
        const urlPath = req.path;
        
        // Default metadata values
        let metaTitle = "programetv.online - Seriale, Știri & Emisiuni Live Online";
        let metaDesc = "Urmărește canale TV românești live, știri, producții autohtone, emisiuni îndrăgite și ghid TV complet direct din browser.";
        let metaImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pro_TV_logo.svg/512px-Pro_TV_logo.svg.png"; // fallback ProTV logo as representative
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        let ldJsonSchema: any = null;

        const dbInstance = getDb();
        
        if (dbInstance) {
          // 1. Live TV Player Page Metadata Injection
          if (urlPath.startsWith('/play/')) {
            const id = urlPath.split('/play/')[1];
            if (id) {
              try {
                const docRef = doc(dbInstance, 'programs', id);
                const d = await getDoc(docRef);
                if (d.exists()) {
                  const data = d.data();
                  metaTitle = `${data.title} Live Online - programetv.online`;
                  if (data.description) {
                    metaDesc = data.description
                      .replace(/[#*`_\[\]]/g, '') // remove markdown symbols
                      .substring(0, 155) + '...';
                  }
                  if (data.thumbnail || data.banner) {
                    metaImage = data.thumbnail || data.banner;
                  }

                  // VideoObject Schema
                  ldJsonSchema = {
                    "@context": "https://schema.org",
                    "@type": "VideoObject",
                    "name": `${data.title} Live Online`,
                    "description": metaDesc,
                    "thumbnailUrl": [metaImage],
                    "uploadDate": data.createdAt || "2026-05-23T19:17:19.841Z",
                    "contentUrl": data.streamUrl || canonicalUrl,
                    "embedUrl": canonicalUrl,
                    "interactionStatistic": {
                      "@type": "InteractionCounter",
                      "interactionType": { "@type": "WatchAction" },
                      "userInteractionCount": data.views || 0
                    }
                  };
                }
              } catch (e) {
                console.error("Error fetching program metadata for crawler:", e);
              }
            }
          }
          // 2. News Article Page Metadata Injection
          else if (urlPath.startsWith('/news/')) {
            const slug = urlPath.split('/news/')[1];
            if (slug) {
              try {
                const q = query(collection(dbInstance, 'articles'), where('slug', '==', slug));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                  const data = snapshot.docs[0].data();
                  metaTitle = `${data.title} - Știri programetv.online`;
                  if (data.content) {
                    metaDesc = data.content
                      .replace(/[#*`_\[\]]/g, '')
                      .substring(0, 155) + '...';
                  }
                  if (data.thumbnail) {
                    metaImage = data.thumbnail;
                  }

                  // NewsArticle Schema
                  ldJsonSchema = {
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": data.title,
                    "image": [metaImage],
                    "datePublished": data.createdAt || new Date().toISOString(),
                    "dateModified": data.createdAt || new Date().toISOString(),
                    "author": {
                      "@type": "Organization",
                      "name": "programetv.online Editor",
                      "url": `${req.protocol}://${req.get('host')}`
                    }
                  };
                }
              } catch (e) {
                console.error("Error fetching article metadata for crawler:", e);
              }
            }
          }
          // 3. TV Show Detail Page Metadata Injection
          else if (urlPath.startsWith('/shows/')) {
            const slug = urlPath.split('/shows/')[1];
            if (slug) {
              try {
                const q = query(collection(dbInstance, 'shows'), where('slug', '==', slug));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                  const data = snapshot.docs[0].data();
                  metaTitle = `${data.title} (Serial / Emisiune) - programetv.online`;
                  if (data.description) {
                    metaDesc = data.description
                      .replace(/[#*`_\[\]]/g, '')
                      .substring(0, 155) + '...';
                  }
                  if (data.thumbnail || data.banner) {
                    metaImage = data.thumbnail || data.banner;
                  }

                  // TVSeries Schema
                  ldJsonSchema = {
                    "@context": "https://schema.org",
                    "@type": "TVSeries",
                    "name": data.title,
                    "description": metaDesc,
                    "image": metaImage
                  };
                }
              } catch (e) {
                console.error("Error fetching show metadata for crawler:", e);
              }
            }
          }
          // 4. Legal Compliance Pages Metadata Injection
          else if (urlPath.startsWith('/legal')) {
            const tab = req.query.tab || 'termeni';
            if (tab === 'privacy') {
              metaTitle = "Politica de Confidențialitate și GDPR - programetv.online";
              metaDesc = "Află cum îți protejăm datele cu caracter personal conform Regulamentului GDPR (UE) 2016/679. Drepturile tale, prelucrarea datelor și securitatea pe portal.";
            } else if (tab === 'cookie') {
              metaTitle = "Politica privind Modulele Cookie - programetv.online";
              metaDesc = "Informații complete despre utilizarea modulelor cookie și tehnologiilor de colectare de pe site-ul nostru de streaming și noutăți TV.";
            } else if (tab === 'dmca') {
              metaTitle = "Drepturi de Autor, DMCA și Notificări Takedown - programetv.online";
              metaDesc = "Procedura legală completă pentru respectarea drepturilor de autor pe programetv.online. Formular oficial DMCA Takedown și Contranotificare în limba română.";
            } else if (tab === 'disclaimer') {
              metaTitle = "Disclaimer și Declinarea Responsabilității - programetv.online";
              metaDesc = "programetv.online este un agregator de fluxuri video publice independente. Notă privind responsabilitatea conținutului încorporat prin iframe.";
            } else if (tab === 'aup') {
              metaTitle = "Politica de Utilizare Acceptabilă (AUP) - programetv.online";
              metaDesc = "Regulile comunității și restricțiile tehnice pentru utilizarea serviciului nostru. Interzicerea scraping-ului neautorizat și a comentariilor dăunătoare.";
            } else if (tab === 'contact') {
              metaTitle = "Contact Juridic, DPO și Raportări Oficiale - programetv.online";
              metaDesc = "Cum poți lua legătura cu Ofițerul nostru pentru Protecția Datelor (DPO) sau cum trimiți o sesizare oficială. Formular securizat de contact legal.";
            } else if (tab === 'ads') {
              metaTitle = "Politica de Afiliere și Publicitate - programetv.online";
              metaDesc = "Transparență totală referitoare la monetizarea conținutului, inserția publicitară, rețelele de publicitate terțe și linkurile de afiliere.";
            } else {
              metaTitle = "Termeni și Condiții de Utilizare - programetv.online";
              metaDesc = "Citește termenii și condițiile de utilizare programetv.online. Reguli de acces, licențiere conținut media și obligații legale actualizate pentru anul 2026.";
            }

            // WebPage Schema
            ldJsonSchema = {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": metaTitle,
              "description": metaDesc,
              "publisher": {
                "@type": "Organization",
                "name": "programetv.online",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pro_TV_logo.svg/512px-Pro_TV_logo.svg.png"
                }
              }
            };
          }
        }

        // Standard WebSite / Brand Schema for other pages
        if (!ldJsonSchema) {
          ldJsonSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "programetv.online",
            "url": `${req.protocol}://${req.get('host')}`,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${req.protocol}://${req.get('host')}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          };
        }

        // Build dynamically injected tags
        const headTags = `
    <title>${metaTitle}</title>
    <meta name="description" content="${metaDesc}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${metaTitle}" />
    <meta property="og:description" content="${metaDesc}" />
    <meta property="og:image" content="${metaImage}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="${urlPath.startsWith('/play/') ? 'video.other' : urlPath.startsWith('/news/') ? 'article' : 'website'}" />
    <meta property="og:site_name" content="programetv.online" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metaTitle}" />
    <meta name="twitter:description" content="${metaDesc}" />
    <meta name="twitter:image" content="${metaImage}" />
    <script type="application/ld+json">
      ${JSON.stringify(ldJsonSchema || {}, null, 2)}
    </script>
        `.trim();

        // Inject inside HTML
        // Replace default html lang and default title
        html = html.replace('<html lang="en">', '<html lang="ro">');
        html = html.replace('<title>programetv.online</title>', headTags);

        res.send(html);
      } catch (err) {
        console.error("Critical error in dynamic SEO index handler:", err);
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    // Start background jobs
    startCronJobs();
  });
}

startServer().catch(console.error);

