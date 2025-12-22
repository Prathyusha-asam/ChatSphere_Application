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

// =======================================================
// Create User Profile
// =======================================================
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

// =======================================================
// Get User Profile
// =======================================================
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

// =======================================================
// Emoji Reaction (per message)
// =======================================================
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

// =======================================================
// Star Message (per user)
// =======================================================
export async function toggleStar(
  messageId: string,
  userId: string
) {
  await updateDoc(doc(db, "messages", messageId), {
    starredBy: arrayUnion(userId),
  });
}

// =======================================================
// Update User Profile
// =======================================================
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

// =======================================================
// Send Message (supports reply)
// =======================================================
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