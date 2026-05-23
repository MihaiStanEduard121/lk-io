import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let db: any = null;

export function initFirebaseBackend() {
  if (db) return db;
  
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const apps = getApps();
      let app;
      if (apps.length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      console.log('Backend Firebase Initialized');
    } catch (e: any) {
      console.error('Failed to initialize Backend Firebase:', e.message);
    }
  } else {
    console.warn('No firebase-applet-config.json found!');
  }
  return db;
}

export function getDb() {
  return db;
}
