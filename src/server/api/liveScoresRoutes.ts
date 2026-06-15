import { Router } from 'express';
import { getDb } from '../firebaseAdmin.js';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import slugify from 'slugify';
import axios from 'axios';

const router = Router();

// To be called periodically (e.g., via a Cron Job or frontend trigger)
router.get('/sync', async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
       return res.status(400).json({ 
        success: false, 
        message: 'GEMINI_API_KEY is missing. It is required for article generation.' 
      });
    }

    // Fetch live matches from ESPN free public API
    const response = await axios.get('http://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
    
    if (response.status !== 200) {
       throw new Error(`ESPN API error: ${response.status}`);
    }

    const data = response.data;
    const events = data.events || [];

    const db = getDb();
    if (!db) throw new Error('DB not initialized');

    // Load active articles config to determine default category
    let defaultCategoryId = 'noutati';
    const qCats = query(collection(db, 'categories'));
    const catDocs = await getDocs(qCats);
    if (!catDocs.empty) {
      defaultCategoryId = catDocs.docs[0].id;
    }

    const eventLogs: string[] = [];
    let generatedCount = 0;

    for (const event of events) {
      const matchStatusState = event.status.type.state; // 'pre', 'in', 'post'
      const matchClock = event.status.displayClock; // e.g. "45'"

      // We only care about LIVE matches
      if (matchStatusState !== 'in') {
         continue;
      }

      const competitors = event.competitions[0].competitors;
      const homeInfo = competitors.find((c: any) => c.homeAway === 'home');
      const awayInfo = competitors.find((c: any) => c.homeAway === 'away');

      if (!homeInfo || !awayInfo) continue;

      const homeTeam = homeInfo.team.displayName || homeInfo.team.name;
      const awayTeam = awayInfo.team.displayName || awayInfo.team.name;
      
      const goalsHome = parseInt(homeInfo.score) || 0;
      const goalsAway = parseInt(awayInfo.score) || 0;
      
      const fixtureId = String(event.id);
      
      // Check if we already registered this score using originalLink
      const artQuery = query(
        collection(db, 'articles'), 
        where('originalLink', '==', `espn-${fixtureId}-${goalsHome}-${goalsAway}`)
      );
      const artDocs = await getDocs(artQuery);
      
      // If we don't have an article for this specific score yet, and someone scored (>0)
      if (artDocs.empty && (goalsHome > 0 || goalsAway > 0)) {
         
         eventLogs.push(`Goal detected: ${homeTeam} ${goalsHome} - ${goalsAway} ${awayTeam}`);
         
         // Generate an Article using Gemini
         const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } }
         });

         const prompt = `You are a sports journalist. A goal has been scored in the live match between ${homeTeam} and ${awayTeam}. 
         The current score is ${homeTeam} ${goalsHome} - ${goalsAway} ${awayTeam} (Minute: ${matchClock}).
         Write a short highly engaging breaking news article of max 200 words detailing the impact of this score. Write directly, in an alert tone, without introductions. English language.`;

         const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              temperature: 0.7,
            }
         });

         const content = aiResponse.text || '';
         const title = `GOOAL! ${homeTeam} vs ${awayTeam}: The score reaches ${goalsHome}-${goalsAway} in minute ${matchClock}`;
         
         let rawSlug = slugify(title, { lower: true, strict: true, locale: 'ro' });
         
         const newArticle = {
            title: title,
            slug: rawSlug + '-' + Math.floor(Math.random() * 1000),
            content: content,
            coverImage: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80',
            banner: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80',
            categoryId: defaultCategoryId,
            author: 'AI Reporter Live',
            originalLink: `espn-${fixtureId}-${goalsHome}-${goalsAway}`,
            status: 'published',
            views: 0,
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
         };

         const ref = doc(collection(db, 'articles'));
         await setDoc(ref, newArticle);
         generatedCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `ESPN Sync complete. Articles generated: ${generatedCount}`,
      logs: eventLogs,
      fixturesScanned: events.length
    });

  } catch (error: any) {
    console.error('[Live Scores] Sync error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error syncing ESPN live scores.' });
  }
});

export default router;
