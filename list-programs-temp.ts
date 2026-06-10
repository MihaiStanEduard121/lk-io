import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function listPrograms() {
  const querySnapshot = await getDocs(collection(db, 'programs'));
  console.log(`FOUND ${querySnapshot.size} total programs in Firestore.`);
  
  const programs = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      category: data.category,
      hasDescription: !!data.description,
      descLength: data.description ? data.description.length : 0
    };
  });

  console.log("Programs breakdown:");
  console.log(JSON.stringify(programs, null, 2));
}

listPrograms().catch(console.error);
