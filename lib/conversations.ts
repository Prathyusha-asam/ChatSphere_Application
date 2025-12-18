import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Creates a conversation between two users
 * Returns existing conversation if already present
 */
export async function createConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  if (currentUserId === otherUserId) {
    throw new Error("Cannot create conversation with yourself");
  }

  try {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUserId)
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.participants.includes(otherUserId)) {
        return doc.id;
      }
    }

    const docRef = await addDoc(collection(db, "conversations"), {
      participants: [currentUserId, otherUserId],
      type: "direct",
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}
