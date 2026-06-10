import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getDb } from '../firebaseAdmin.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const router = Router();

// Detailed prompts for each of the 5 chapters, aiming for ~2000 words per chapter
const CHAPTERS = [
  {
    title: "1. Introducere, Originile și Istoricul Complet al Canalului",
    prompt: (name: string, category: string) => `Tu ești un istoric media și jurnalist de elită. Scrie primul capitol dintr-o monografie amplă a canalului de televiziune '${name}'. Acest capitol trebuie să conțină o analiză istorică aprofundată și extrem de detaliată de cel puțin 2000 de cuvinte (în limba română), organizată în subsecțiuni Markdown clare (utilizând h3: '###' și h4: '####' pentru structură), cu privire la originile postului, contextul socio-politic și starea mass-media din România la momentul lansării, primul sediu, primii acționari sau fondatori, evoluția brandului și a identității vizuale de-a lungul anilor, achizițiile strategice sau restructurările, evoluția audiențelor istorice și momentele de transformare majoră. Folosește un stil redactat la cel mai înalt nivel literar și jurnalistic, cu detalii bogate, exhaustive, fără a repeta ideile, ci aprofundând fiecare aspect istoric relevant în profunzime.`
  },
  {
    title: "2. Grila Extinsă de Programe, Emisiuni de Referință și Personalități Emblematice",
    prompt: (name: string, category: string) => `Tu ești un analist și critic TV profesionist. Scrie al doilea capitol dintr-o monografie amplă a canalului de televiziune '${name}'. Acest capitol trebuie să aibă cel puțin 2000 de cuvinte (în limba română), structurat în subcapitole Markdown clare. Analizează exhaustiv grila de programe istorică și actuală a postului '${name}'. Detaliază emisiunile matinale emblematice, emisiunile de știri și dezbateri politice sau sociale, programele de divertisment din prime-time, talk-show-urile de succes, serialele românești sau străine populare transmise, și emisiunile speciale de sărbători sau transmisiunile sportive. Pentru fiecare emisiune majoră în parte, explică conceptul din spatele ei, motivul succesului la public și evoluția sa cronologică. Dedică de asemenea o secțiune extrem de detaliată gazdelor, prezentatorilor, jurnaliștilor și comentatorilor reprezentativi care au definit imaginea publică a postului, biografii succinte, performanțele lor profesionale și impactul prezenței lor pe micul ecran.`
  },
  {
    title: "3. Publicul Țintă, Profilul Sociodemografic și Strategia de Branding și Marketing",
    prompt: (name: string, category: string) => `Tu ești un expert în marketing, comunicare și branding. Scrie al treilea capitol dintr-o monografie amplă a canalului de televiziune '${name}'. Acest capitol trebuie să aibă cel puțin 2000 de cuvinte (în limba română), structurat în subcapitole Markdown clare. Analizează profilul sociodemografic aprofundat al telespectatorilor postului '${name}' (vârstă, gen, educație, mediu de rezidență, venituri, obiceiuri de cumpărare și comportament de consum TV). Explică în detaliu strategia de poziționare pe piață în raport cu competitorii direcți, evoluția logo-urilor și sloganurilor de-a lungul anilor, campaniile publicitare de promovare memorabile realizate de post, strategia de prezență pe rețelele sociale moderne (YouTube, Facebook, Instagram, TikTok) și modul de monetizare a publicității.`
  },
  {
    title: "4. Aspecte Tehnice, Infrastructura de Transmisie și Inovațiile Digitale",
    prompt: (name: string, category: string) => `Tu ești un inginer de telecomunicații și specialist în tehnologia de broadcast TV. Scrie al patrulea capitol dintr-o monografie amplă a canalului de televiziune '${name}'. Acest capitol trebuie să aibă cel puțin 2000 de cuvinte (în limba română), structurat în subcapitole Markdown clare. Detaliază infrastructura tehnică de prelucrare, producție, regie și emisie a postului '${name}'. Discută despre tipurile de rezoluție (trecerea de la Standard Definition la High Definition, Full HD, UHD 4K, tehnologii HDR), standardele tehnice de transmisie utilizate (satelit, cablu digital - DVB-C, terestru digital - DVB-T2, platforme de streaming IPTV și OTT), tehnologia camerelor și echipamentele din studio, sistemele de editare non-liniară, transmisiile live prin satelit sau internet mobil (sisteme Bonded Cellular 4G/5G), precum și implementarea propriei platforme online de streaming și aplicații mobile dedicate.`
  },
  {
    title: "5. Impactul Socio-Cultural, Recunoașterea Industriei și Retrospectivă Critică",
    prompt: (name: string, category: string) => `Tu ești un sociolog media și critic cultural de prestigiu. Scrie al cincilea și ultimul capitol dintr-o monografie amplă a canalului de televiziune '${name}'. Acest capitol trebuie să aibă cel puțin 2000 de cuvinte (în limba română), structurat în subcapitole clare și logice. Discută pe larg rolul cultural, social și educativ pe care '${name}' l-a jucat în societatea românească de-a lungul deceniilor. Analizează cum a influențat opinia publică și dezbaterile societății în momente-cheie (alegeri democratice, campanii sociale, crize majore). Detaliază premiile câștigate de jurnaliștii, realizatorii și producțiile postului (cum ar fi premiile APTR, gale internaționale, recunoașteri academice). Oferă în același timp o analiză critică și echilibrată a controverselor legate de etica jurnalistică, eventualele amenzi CNA primite, scandaluri mediatice sau acuzații de parțialitate, încheind cu o concluzie de ansamblu solidă despre moștenirea și viitorul acestui brand mass-media.`
  }
];

router.post('/generate-chapter', async (req, res) => {
  try {
    const { programId, title, category, chapterIndex } = req.body;
    
    if (chapterIndex === undefined || chapterIndex < 0 || chapterIndex >= CHAPTERS.length) {
      return res.status(400).json({ success: false, message: 'Index capitol invalid.' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Titlul programului este necesar.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'missing_key',
        message: 'Cheia GEMINI_API_KEY lipsește din secretele aplicației. Vă rugăm să o configurați în Settings > Secrets din stânga-jos în AI Studio.' 
      });
    }

    // Initialize @google/genai client with User-Agent as instructed by guidelines
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const targetChapter = CHAPTERS[chapterIndex];
    const systemInstruction = "Ești un autor enciclopedic specializat în televiziune, mass-media din România și jurnalism cultural. Stilul tău este elegant, critic, obiectiv, captivant și extrem de bogat în detalii, date concrete, nume, povești și analize de fond. Fiecare capitol redactat de tine trebuie să fie o monografie exhaustivă de elită în limba română, de o calitate excepțională, de cel puțin 2000 de cuvinte primite per răspuns. Nu tăia textul, ci folosește la maximum capacitatea de generare și detalieri intense.";

    console.log(`[AI Routes] Generating ${targetChapter.title} for ${title}...`);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: targetChapter.prompt(title, category || 'General'),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 8192, // Max output tokens for longest possible qualitative output
      }
    });

    const content = response.text || '';
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    console.log(`[AI Routes] Generated ${wordCount} words for chapter ${chapterIndex}`);

    res.json({
      success: true,
      title: targetChapter.title,
      content,
      wordCount
    });

  } catch (error: any) {
    console.error('[AI Routes] Generation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Eroare la generarea textului cu Gemini.' });
  }
});

router.post('/save-description', async (req, res) => {
  try {
    const { programId, description } = req.body;
    if (!programId) {
      return res.status(400).json({ success: false, message: 'ID-ul programului este necesar.' });
    }
    const db = getDb();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Firestore nu este inițializat.' });
    }
    await updateDoc(doc(db, 'programs', programId), {
      description
    });
    res.json({ success: true, message: 'Descrierea a fost salvată cu succes în baza de date!' });
  } catch (error: any) {
    console.error('[AI Routes] Save error:', error);
    res.status(500).json({ success: false, message: error.message || 'Eroare la salvare.' });
  }
});

export default router;
