import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import fs from 'fs';

async function run() {
  const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-10f2adfb-0ab0-4fff-87bb-d8985e7bb7c9');

  const d = await getDoc(doc(db, 'settings', 'homepage'));
  if (d.exists()) {
    console.log(d.data());
    let data = d.data();
    let updated = false;
    if (data.heroTitle && data.heroTitle.includes('StreamTV')) {
       data.heroTitle = data.heroTitle.replace('StreamTV', 'programetv.online');
       updated = true;
    }
    if (data.heroSubtitle && data.heroSubtitle.includes('StreamTV')) {
       data.heroSubtitle = data.heroSubtitle.replace('StreamTV', 'programetv.online');
       updated = true;
    }
    if (updated) {
       await updateDoc(doc(db, 'settings', 'homepage'), { heroTitle: data.heroTitle, heroSubtitle: data.heroSubtitle });
       console.log('Updated to', data.heroTitle);
    }
  } else {
    console.log('No homepage settings in DB');
  }
}
run();
