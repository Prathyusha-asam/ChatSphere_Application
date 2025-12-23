import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
//region sendMessage Helper
/**
 * sendMessage
 *
 * Sends a new chat message to Firestore and updates
 * the parent conversation preview.
 *
 * Responsibilities:
 * - Validates authentication
 * - Creates message document
 * - Updates conversation last message metadata
 *
 * @param conversationId - Active conversation ID
 * @param senderId - UID of the message sender
 * @param text - Message content
 * @param replyTo - Optional reply reference
 *
 * @returns Promise<string> - Created message document ID
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  replyTo: {
    id: string;
    text: string;
    senderId: string;
  } | null
) {
  //region Auth Guard
  /**
   * Ensures user is authenticated before sending message
   */
  if (!auth.currentUser) {
    throw new Error("Not authenticated");
  }
  //endregion Auth Guard

  //region Create Message
  /**
   * Creates a new message document
   */
  const ref = await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text,
    replyTo: replyTo || null,
    isRead: false,
    deliveredAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  //endregion Create Message

  //region Update Conversation Preview
  /**
   * Updates conversation metadata for list preview
   */
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
  //endregion Update Conversation Preview
  return ref.id;
}
//endregion sendMessage Helper