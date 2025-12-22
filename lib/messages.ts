/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

/* =========================================================
   SEND MESSAGE (FIXED – GUARANTEED COMMIT)
   ========================================================= */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
  }
) {
  const msg = text.trim();
  if (!msg) return;

  const convoRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(db, "messages");

  await runTransaction(db, async (tx: { set: (arg0: any, arg1: { conversationId: string; senderId: string; text: string; replyTo: { messageId: string; text: string; senderId: string; } | null; createdAt: any; }) => void; update: (arg0: any, arg1: { lastMessage: string; lastMessageAt: any; }) => void; }) => {
    // 1️⃣ Add message
    const messageRef = doc(messagesRef);
    tx.set(messageRef, {
      conversationId,
      senderId,
      text: msg,
      replyTo: replyTo ?? null,
      createdAt: serverTimestamp(),
    });

    // 2️⃣ Update conversation atomically
    tx.update(convoRef, {
      lastMessage: msg,
      lastMessageAt: serverTimestamp(),
    });
  });
}

/* =========================================================
   UPDATE MESSAGE
   ========================================================= */
export async function updateMessage(
  conversationId: string,
  messageId: string,
  text: string
) {
  await updateDoc(doc(db, "messages", messageId), {
    text,
    editedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
  });
}

/* =========================================================
   DELETE MESSAGE (ALREADY FIXED)
   ========================================================= */
export async function deleteMessage(
  conversationId: string,
  messageId: string
) {
  await deleteDoc(doc(db, "messages", messageId));

  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    where("__name__", "!=", messageId),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snap = await getDocs(q);
  const convoRef = doc(db, "conversations", conversationId);

  if (snap.empty) {
    await updateDoc(convoRef, {
      lastMessage: "",
      lastMessageAt: null,
    });
  } else {
    const last = snap.docs[0].data();
    await updateDoc(convoRef, {
      lastMessage: last.text,
      lastMessageAt: last.createdAt,
    });
  }
}
