import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

//region Send Message
/**
 * Saves a message to Firestore
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  if (!text.trim()) return;

  try {
    await addDoc(collection(db, "messages"), {
      conversationId,
      senderId,
      text,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "conversation", conversationId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
//endregion Send Message
