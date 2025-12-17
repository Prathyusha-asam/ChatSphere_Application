import { Timestamp } from "firebase/firestore";

export interface UserDoc {
  email: string;
  displayName: string;
  password: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  createdAt: Timestamp;
}

export interface ConversationDoc {
  participants: string[];
  type: "direct" | "group";
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
}

export interface MessageDoc {
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface TypingIndicatorDoc {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  updatedAt: Timestamp;
}
