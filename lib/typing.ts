import {
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "./firebase";
 
/**
 * setTypingStatus
 *
 * Writes typing state with a fresh timestamp.
 * Safe against logout, refresh, and auth race conditions.
 */
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
) {
  // 🔒 HARD GUARDS (VERY IMPORTANT)
  if (
    !conversationId ||
    !auth.currentUser ||
    auth.currentUser.uid !== userId
  ) {
    return;
  }
 
  const docId = `${conversationId}_${userId}`;
  const ref = doc(db, "typingIndicators", docId);
 
  try {
    // 🔹 Stop typing → delete document (UNCHANGED LOGIC)
    if (!isTyping) {
      await deleteDoc(ref);
      return;
    }
 
    // 🔹 User is typing → update timestamp
    await setDoc(
      ref,
      {
        conversationId,
        userId,
        isTyping: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    return;
  }
}