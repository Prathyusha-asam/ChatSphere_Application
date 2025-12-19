import { Timestamp } from "firebase/firestore";

/**
 * User document structure
 */
export interface UserDoc {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  createdAt: Timestamp;
}

/**
 * Conversation document structure
 */
export interface ConversationDoc {
  participants: string[];
  type: "direct";
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
}

/**
 * Message document structure
 */
export interface MessageDoc {
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: Timestamp;
}

/**
 * Typing indicator document structure
 */
export interface TypingIndicatorDoc {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  updatedAt: Timestamp;
}
