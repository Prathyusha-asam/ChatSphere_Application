//region Firebase Core Imports
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
//endregion Firebase Core Imports

//region Firebase Configuration
/**
 * Firebase configuration loaded from environment variables.
 * NEXT_PUBLIC_* is required for client-side usage in Next.js.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};
//endregion Firebase Configuration

//region Firebase App Initialization
/**
 * Initialize Firebase safely using singleton pattern.
 * Prevents re-initialization during HMR / SSR.
 */
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
//endregion Firebase App Initialization

//region Firebase Services
/**
 * Export Firebase services.
 * These are safe to import in client components.
 */
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Analytics must ONLY run in browser
export let analytics: Analytics | undefined;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
//endregion Firebase Services

//region Default Export
export default app;
//endregion Default Export
