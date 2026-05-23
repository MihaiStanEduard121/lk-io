import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let db: any = null;

export function initFirebaseBackend() {
  if (db) return db;
  
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log('Backend Firebase Initialized');
  } else {
    console.warn('No firebase-applet-config.json found!');
  }
  return db;
}

export function getDb() {
  return db;
}
