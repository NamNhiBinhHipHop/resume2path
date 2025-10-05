import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, doc, getDoc, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Check if Firebase is configured
// const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value !== 'your_firebase_key_here');

// let app: any = null;
// let auth: any = null;
// let provider: any = null;
// let db: any = null;

// if (isFirebaseConfigured) {
//   try {
//     // Prevent duplicate app init during HMR
//     app = getApps().length ? getApp() : initializeApp(firebaseConfig);
//     auth = getAuth(app);
//     provider = new GoogleAuthProvider();
//     // Try to initialize Firestore with long polling for networks that block WebSockets
//     try {
//       db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
//     } catch {
//       db = getFirestore(app);
//     }
//   } catch (error) {
//     console.warn('Firebase initialization failed:', error);
//     // Set to null for demo mode
//     app = null;
//     auth = null;
//     provider = null;
//     db = null;
//   }
// } else {
//   console.log('Firebase not configured, running in demo mode');
// }

// // Lightweight connectivity test for debugging: tries to read a known doc
export async function testFirebaseConnection() {
  if (!db) {
    return { ok: false, error: 'Firebase not configured' } as const;
  }
  
  try {
    const pingRef = doc(db, '__health', 'ping');
    await getDoc(pingRef).catch((e: any) => {
      // Permission denied still proves connectivity
      if (e?.code === 'permission-denied') return null;
      throw e;
    });
    return { ok: true } as const;
  } catch (e: any) {
    return { ok: false, error: String(e) } as const;
  }
}

// export { auth, provider, db };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();