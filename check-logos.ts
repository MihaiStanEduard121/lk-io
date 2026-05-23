import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const querySnapshot = await getDocs(collection(db, 'programs'));
  const missing = [];
  for (const item of querySnapshot.docs) {
    const data = item.data();
    if (data.thumbnail.includes('unsplash') || data.thumbnail === 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80') {
      missing.push(data.title);
    }
  }
  console.log('Missing logos for:', missing);
  process.exit(0);
}

check().catch(console.error);
