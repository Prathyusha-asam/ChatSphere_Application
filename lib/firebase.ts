//region Firebase Core Imports
/**
 * Firebase SDK imports for app initialization and services
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//endregion Firebase Core Imports
//region Firebase Configuration
/**
 * Firebase configuration
 * Values are loaded from environment variables
 * (NEXT_PUBLIC_* is required for client-side access in Next.js)
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
//endregion Firebase Configuration
//region Firebase App Initialization
/**
 * Prevent Firebase re-initialization in Next.js
 * (Important for hot reload & server/client rendering)
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
//endregion Firebase App Initialization
//region Firebase Services
/**
 * Export initialized Firebase services
 */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
//endregion Firebase Services
//region Default Export
/**
 * Export Firebase app instance
 */
export default app;
//endregion Default Export