import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

//region Create Conversation
/**
 * Creates a conversation between two users
 * Returns existing conversation if already present
 */
export async function createConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  try {
    // 🔹 Check if conversation already exists
    const q = query(
      collection(db, "conversation"),
      where("participants", "array-contains", currentUserId)
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.participants.includes(otherUserId)) {
        return doc.id;
      }
    }

    // 🔹 Create new conversation
    const docRef = await addDoc(collection(db, "conversation"), {
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
//endregion Create Conversation
