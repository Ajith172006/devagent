import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
} = import.meta.env;

export const firebaseConfigured = !!(VITE_FIREBASE_API_KEY && VITE_FIREBASE_PROJECT_ID);

let app: FirebaseApp | null = null;

if (firebaseConfigured) {
  app = initializeApp({
    apiKey: VITE_FIREBASE_API_KEY,
    authDomain: VITE_FIREBASE_AUTH_DOMAIN,
    projectId: VITE_FIREBASE_PROJECT_ID,
    storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: VITE_FIREBASE_APP_ID,
  });
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const auth = firebaseConfigured ? getAuth(app!) : null;
export const googleProvider = new GoogleAuthProvider();
