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
} from "firebase/firestore";
import { db } from "./firebase";

/* =========================================================
   SEND MESSAGE (UNCHANGED)
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

  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text: msg,
    replyTo: replyTo ?? null,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: msg,
    lastMessageAt: serverTimestamp(),
  });
}

/* =========================================================
   UPDATE MESSAGE (EDIT)  FIXED
========================================================= */
export async function updateMessage(
  conversationId: string,
  messageId: string,
  text: string
) {
  const msg = text.trim();
  if (!msg) return;

  /* 🔧 1. Update message text + editedAt */
  await updateDoc(doc(db, "messages", messageId), {
    text: msg,
    editedAt: serverTimestamp(), 
  });

  /* 🔧 2. Keep conversation metadata consistent */
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: msg,
    lastMessageAt: serverTimestamp(),
  });
}

/* =========================================================
   DELETE MESSAGE (UNCHANGED)
========================================================= */
export async function deleteMessage(
  conversationId: string,
  messageId: string
) {
  await deleteDoc(doc(db, "messages", messageId));

  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
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
