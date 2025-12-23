import {
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "./firebase";
//region setTypingStatus Helper
/**
 * setTypingStatus
 *
 * Persists user typing state for a conversation.
 * Designed to be resilient against:
 * - Logout
 * - Refresh
 * - Auth race conditions
 *
 * Behavior:
 * - Creates / updates typing indicator when user is typing
 * - Deletes indicator when user stops typing
 *
 * @param conversationId - Active conversation ID
 * @param userId - UID of the typing user
 * @param isTyping - Whether user is currently typing
 */
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
) {
  //region Hard Guards
  /**
   * Prevents invalid writes caused by:
   * - Missing conversation
   * - Unauthenticated user
   * - UID mismatch
   */
  if (
    !conversationId ||
    !auth.currentUser ||
    auth.currentUser.uid !== userId
  ) {
    return;
  }
  //endregion Hard Guards

  //region Document Reference
  /**
   * Unique typing indicator document per conversation + user
   */
  const docId = `${conversationId}_${userId}`;
  const ref = doc(db, "typingIndicators", docId);
  //endregion Document Reference

  //region Write Typing State
  try {
    // Stop typing → delete document (UNCHANGED LOGIC)
    if (!isTyping) {
      await deleteDoc(ref);
      return;
    }
    /**
        * User is typing → upsert timestamped indicator
        */
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
    /**
    * Fail silently to avoid UI interruption
    */
    return;
  }
  //endregion Write Typing State
}
//endregion setTypingStatus Helper