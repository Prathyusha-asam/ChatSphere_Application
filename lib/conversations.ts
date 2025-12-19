import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function createConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  if (currentUserId === otherUserId) {
    throw new Error("Invalid conversation");
  }

  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUserId)
  );

  const snapshot = await getDocs(q);

  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.participants.includes(otherUserId)) {
      return d.id;
    }
  }

  const docRef = await addDoc(collection(db, "conversations"), {
    participants: [currentUserId, otherUserId],
    type: "direct",
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageAt: null,
  });


  return docRef.id;
}
