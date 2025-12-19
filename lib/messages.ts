import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

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
