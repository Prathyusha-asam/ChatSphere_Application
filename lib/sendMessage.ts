import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
) {
  const msg = text?.trim();
  if (!msg) return;

  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text: msg,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: msg,
    lastMessageAt: serverTimestamp(),
  });
}
