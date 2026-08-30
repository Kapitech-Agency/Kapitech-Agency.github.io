import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect if config has valid non-dummy production credentials
export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('Dummy') &&
  !firebaseConfig.apiKey.includes('Mocking') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('applet-')
);

let appInstance;
let firestoreDb: Firestore | null = null;

try {
  if (!getApps().length) {
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApp();
  }

  if (isFirebaseConfigured) {
    firestoreDb = getFirestore(appInstance);
  }
} catch (err) {
  console.debug('Firebase initialization notice (running in local database mode):', err);
}

export const app = appInstance;
export const db = firestoreDb;
export default app;
