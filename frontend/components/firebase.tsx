import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use NEXT_PUBLIC_* env vars for client-side Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Don't initialize Firebase on the server (pre-render/build). Initialize lazily on the client.
let app = null;
let auth = null;
let provider = null;
let db = null;

if (typeof window !== "undefined") {
  // Use a global cache to avoid re-initializing during HMR or multiple imports
  const g = globalThis as any;
  if (!g.__firebaseApp) {
    g.__firebaseApp = initializeApp(firebaseConfig);
    g.__firebaseAuth = getAuth(g.__firebaseApp);
    g.__firebaseProvider = new GoogleAuthProvider();
    g.__firebaseDb = getFirestore(g.__firebaseApp);
  }

  app = g.__firebaseApp;
  auth = g.__firebaseAuth;
  provider = g.__firebaseProvider;
  db = g.__firebaseDb;
}

export { auth, provider, signInWithPopup, db, EmailAuthProvider, linkWithCredential };
