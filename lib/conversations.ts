import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
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
    // 🔍 Check if conversation already exists
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUserId)
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.participants?.includes(otherUserId)) {
        return docSnap.id;
      }
    }

    // ✅ Create new conversation WITH lastMessageAt
    const docRef = await addDoc(collection(db, "conversations"), {
      participants: [currentUserId, otherUserId],
      type: "direct",

      // 🔑 REQUIRED for conversation list ordering
      lastMessage: "",
      lastMessageAt: serverTimestamp(),

      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}
