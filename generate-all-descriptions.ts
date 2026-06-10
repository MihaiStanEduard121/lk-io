import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// 1. Initialize Firebase
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 2. Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ EROARE: GEMINI_API_KEY nu este configurat în mediu!");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

// Helper to split array into chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function main() {
  try {
    console.log("Fetching programs from Firestore...");
    const querySnapshot = await getDocs(collection(db, 'programs'));
    const allDocs = querySnapshot.docs;
    console.log(`Found ${allDocs.length} programs to process.`);

    const batches = chunkArray(allDocs, 10);
    let totalSuccess = 0;

    console.log(`Split into ${batches.length} batches of max 10 channels.`);

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      console.log(`\n--- Processing Batch ${batchIdx + 1} of ${batches.length} ---`);
      const currentBatch = batches[batchIdx];

      // Run this entire batch in parallel!
      const promises = currentBatch.map(async (docSnap) => {
        const data = docSnap.data();
        const channelId = docSnap.id;
        const title = data.title;
        const category = data.category || 'General';

        if (!title) return { success: false, title: "Fără titlu" };

        const prompt = `Ești un specialist în mass-media românească, istoric TV și jurnalist cultural veteran.
Scrie o monografie concisă, dar informativă și extrem de bine structurată (aproximativ 300-400 de cuvinte în limba română) pentru canalul de televiziune numit: "${title}" (Categorie: ${category}).

Descrierea ta trebuie să fie redactată la persoana a III-a, cu un ton neutru, profesionist și captivant, utilizând corect diacriticele românești. 
Te rog să folosești formatare Markdown simplă (folosind titluri scurte "###", sublinieri și liste) incluzând următoarele aspecte:
1. **Scurt Istoric & Lansare**: Când a apărut pe piață postul de televiziune, contextul lansării sau evoluția generală a brandului.
2. **Grila de Programe & Emisiuni Cheie**: Ce tipuri de emisiuni transmite, producții românești sau străine de succes, genuri muzicale/știri/sport sau desene animate populare (în funcție de profilul real al postului).
3. **Public Țintă & Impact**: Cine sunt telespectatorii fideli ai canalului și de ce este brandul apreciat de români.

Răspunde DOAR cu materialul monografic redactat elegant, fără introduceri de tipul "Iată descrierea cerută" sau comentarii suplimentare. Marcupează secțiunile cu "### Istoric", "### Grila de Programe" și "### Public și Impact".`;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              temperature: 0.7,
              systemInstruction: "Ești un autor enciclopedic profesionist, specializat în televiziune, radio și mass-media.",
            }
          });

          const descriptionMarkdown = response.text || '';
          if (descriptionMarkdown.trim().length > 100) {
            await updateDoc(doc(db, 'programs', channelId), {
              description: descriptionMarkdown.trim()
            });
            console.log(`  ✅ Generat și salvat: "${title}"`);
            return { success: true, title };
          } else {
            console.warn(`  ⚠️ Rezultat prea scurt pentru: "${title}"`);
            return { success: false, title };
          }
        } catch (err: any) {
          console.error(`  ❌ Eroare la: "${title}":`, err.message || err);
          return { success: false, title };
        }
      });

      const results = await Promise.all(promises);
      const batchSuccess = results.filter(r => r.success).length;
      totalSuccess += batchSuccess;

      console.log(`Batch ${batchIdx + 1} done! ${batchSuccess}/${currentBatch.length} saved.`);
      
      // Delay to respect rate limits between batches
      if (batchIdx < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    console.log(`\n🎉 PROCES COMPLETAT! S-au actualizat cu succes descrierile pentru ${totalSuccess} din ${allDocs.length} canale TV.`);

  } catch (err) {
    console.error("Eroare fatală:", err);
  } finally {
    process.exit(0);
  }
}

main();
