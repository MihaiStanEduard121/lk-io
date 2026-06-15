import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import fs from 'fs';

async function run() {
  const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-10f2adfb-0ab0-4fff-87bb-d8985e7bb7c9');

  const snap = await getDocs(collection(db, 'articles'));
  snap.docs.forEach(d => console.log(d.id, d.data().title, 'STATUS:', d.data().status, 'SLUG:', d.data().slug));
}
run();
