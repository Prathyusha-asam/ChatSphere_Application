import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
export const createUserProfile = async (
  userId: string,
  email: string,
  displayName: string
) => {
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
};
 
export const getUserProfile = async (userId: string) => {
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
};
 
 