import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return firebaseApp;
}

export function getFirebaseDb(): Firestore {
  if (!firestoreDb) {
    const app = getFirebaseApp();
    firestoreDb = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
  return firestoreDb;
}

export const db = typeof window !== 'undefined' || process.env.NODE_ENV !== 'test'
  ? getFirebaseDb()
  : (null as unknown as Firestore);

export default getFirebaseApp;
