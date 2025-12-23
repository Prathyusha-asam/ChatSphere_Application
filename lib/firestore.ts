//region Firestore Imports
/**
 * Firestore helpers for user profiles, reactions, and messaging
 */
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  DocumentData,
  updateDoc,
  arrayUnion,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "./firebase";
//endregion Firestore Imports
//region Create User Profile
/**
 * Creates a user profile document in Firestore
 * Executed during user registration
 */
export async function createUserProfile(
  userId: string,
  email: string,
  displayName: string
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      userId,
      email,
      displayName,
      photoURL: "",
      isOnline: false,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}
//endregion Create User Profile
//region Get User Profile
/**
 * Fetches a user's profile data from Firestore
 */
export async function getUserProfile(
  userId: string
): Promise<DocumentData | null> {
  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}
//endregion Get User Profile
//region Emoji Reaction (Per Message)
/**
 * Adds an emoji reaction to a message for a specific user
 */
export async function toggleReaction(
  messageId: string,
  emoji: string,
  userId: string
) {
  const ref = doc(db, "messages", messageId);
  await updateDoc(ref, {
    [`reactions.${emoji}`]: arrayUnion(userId),
  });
}
//endregion Emoji Reaction
//region Star Message (Per User)
/**
 * Stars a message for the current user
 */
export async function toggleStar(
  messageId: string,
  userId: string
) {
  await updateDoc(doc(db, "messages", messageId), {
    starredBy: arrayUnion(userId),
  });
}
//endregion Star Message
//region Update User Profile
/**
 * Updates user profile fields in Firestore
 * Uses merge to preserve existing data
 */
export async function updateUserProfile(
  userId: string,
  data: {
    displayName?: string;
    photoURL?: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);

    await setDoc(
      userRef,
      {
        ...data,
        ...(data.lastSeen ? {} : { lastSeen: serverTimestamp() }),
      },
      { merge: true }
    );
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
//endregion Update User Profile
//region Send Message
/**
 * Sends a message to a conversation
 * Supports optional reply-to functionality
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  replyTo?: {
    id: string;
    text: string;
    senderId?: string;
  } | null
) {
  const msg = text?.trim();
  if (!msg) return;
  // Create message document
  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    text: msg,
    replyTo: replyTo ?? null,
    createdAt: serverTimestamp(),
  });
  // Update conversation metadata
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: msg,
    lastMessageAt: serverTimestamp(),
  });
}
//endregion Send Message