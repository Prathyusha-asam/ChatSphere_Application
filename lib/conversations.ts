//region Firebase Imports
/**
 * Firestore helpers used for conversation management
 */
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
//endregion Firebase Imports

//region Create Conversation
/**
 * createConversation
 *
 * Creates a new one-to-one conversation between two users
 * OR returns an existing conversation ID if it already exists.
 *
 * @param currentUserId - Logged-in user's UID
 * @param otherUserId - Target user's UID
 * @returns Promise<string> - Conversation document ID
 */
export async function createConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  // Prevent creating a conversation with self
  if (currentUserId === otherUserId) {
    throw new Error("Invalid conversation");
  }
  // Query all conversations where current user is a participant
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUserId)
  );
  // Fetch matching conversations
  const snapshot = await getDocs(q);
  // Check if a conversation with the other user already exists
  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.participants.includes(otherUserId)) {
      return d.id;
    }
  }
  // Create a new direct conversation if none exists
  const docRef = await addDoc(collection(db, "conversations"), {
    participants: [currentUserId, otherUserId],
    type: "direct",
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageAt: null,
  });
  // Return newly created conversation ID
  return docRef.id;
}
//endregion Create Conversation