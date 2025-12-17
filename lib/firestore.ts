import {doc,setDoc,getDoc,serverTimestamp,DocumentData,} from "firebase/firestore";
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  }
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...data,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
// #endregion Update User Profile
