import {
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * setTypingStatus
 *
 * Writes typing state with a fresh timestamp every time.
 * This prevents "ghost typing" issues.
 */
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
) {
  const docId = `${conversationId}_${userId}`;
  const ref = doc(db, "typingIndicators", docId);

  // When user stops typing, we DELETE the document
  // This is the cleanest & safest approach
  if (!isTyping) {
    await deleteDoc(ref);
    return;
  }

  // When user is typing, always update timestamp
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
}
