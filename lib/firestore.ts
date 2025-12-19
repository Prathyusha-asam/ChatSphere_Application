import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

//region Create User Profile
/**
 * Creates a user profile document in Firestore
 * Called immediately after successful signup
 */
export async function createUserProfile(
  userId: string,
  email: string,
  displayName: string
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);

    await setDoc(userRef, {
      userId,
      email,
      displayName,
      photoURL: "",
      isOnline: false,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}
//endregion Create User Profile

//region Get User Profile
/**
 * Fetches a user profile from Firestore by userId
 * Returns null if user does not exist
 */
export async function getUserProfile(
  userId: string
): Promise<DocumentData | null> {
  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}
//endregion Get User Profile

// #region Update User Profile
/**
 * Updates user profile fields in Firestore
 * Called from Profile Edit form
 */
export async function updateUserProfile(
  userId: string,
  data: {
    displayName?: string;
    photoURL?: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);

    await setDoc(
      userRef,
      {
        ...data,
        ...(data.lastSeen ? {} : { lastSeen: serverTimestamp() }),
      },
      { merge: true }
    );
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
// #endregion Update User Profile





/* =====================================================
   🔹 ADDED SECTION (DOES NOT MODIFY ORIGINAL CODE)
   USER PRESENCE HELPERS
===================================================== */

/**
 * Marks user as ONLINE
 * Safe for first-time users (no document error)
 */
export async function setUserOnline(userId: string): Promise<void> {
  const userRef = doc(db, "users", userId);

  await setDoc(
    userRef,
    {
      isOnline: true,
      lastSeen: serverTimestamp(),
    },
    { merge: true } // ✅ ensures no "No document to update" error
  );
}

/**
 * Marks user as OFFLINE
 * Called on logout / tab close / disconnect
 */
export async function setUserOffline(userId: string): Promise<void> {
  const userRef = doc(db, "users", userId);

  await setDoc(
    userRef,
    {
      isOnline: false,
      lastSeen: serverTimestamp(),
    },
    { merge: true } // ✅ safe update
  );
}