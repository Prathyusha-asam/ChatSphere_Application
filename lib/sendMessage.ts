import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Sends a new message to Firestore
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
  if (!auth.currentUser) {
    throw new Error("Not authenticated");
  }

  // 📩 Create message
  const ref = await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text,
    replyTo: replyTo || null,    
    isRead: false,                
    deliveredAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  // 🧾 Update conversation preview
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });

  return ref.id;
}
