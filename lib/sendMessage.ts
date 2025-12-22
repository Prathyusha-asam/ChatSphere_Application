import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Sends a message and updates the conversation metadata
 * IMPORTANT: Conversation update is REQUIRED for sidebar performance
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  try {
    // ===============================
    // 1. Save message
    // ===============================
    await addDoc(collection(db, "messages"), {
      conversationId,
      senderId,
      text,
      createdAt: serverTimestamp(),
      isRead: false,
    });

    // ===============================
    // 2. Update conversation (CRITICAL)
    // ===============================
    const conversationRef = doc(db, "conversations", conversationId);

    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
