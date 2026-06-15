import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore/lite';
import fs from 'fs';

async function run() {
  const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-10f2adfb-0ab0-4fff-87bb-d8985e7bb7c9');

  console.log('Querying for: fluier-final-mexic-învinge-clar-africa-de-sud-cu-2-0')
  const q = query(collection(db, 'articles'), where('slug', '==', 'fluier-final-mexic-învinge-clar-africa-de-sud-cu-2-0'));
  const snap = await getDocs(q);
  console.log('Docs found:', snap.docs.length);

  
  console.log('Querying for URL Encoded: ' + encodeURIComponent('fluier-final-mexic-învinge-clar-africa-de-sud-cu-2-0'))
  const q2 = query(collection(db, 'articles'), where('slug', '==', encodeURIComponent('fluier-final-mexic-învinge-clar-africa-de-sud-cu-2-0')));
  const snap2 = await getDocs(q2);
  console.log('Docs found url encoded:', snap2.docs.length);
}
run();
