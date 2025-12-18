import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

//region Typing Indicator

/**
 * Sets typing status for a user in a conversation
 */
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const docId = `${conversationId}_${userId}`;
  const typingRef = doc(db, "typingIndicators", docId);

  try {
    if (isTyping) {
      await setDoc(typingRef, {
        conversationId,
        userId,
        isTyping: true,
        updatedAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(typingRef);
    }
  } catch (error) {
    console.error("Error updating typing status:", error);
    throw error;
  }
}

//endregion Typing Indicator
