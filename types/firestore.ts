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
  mutedFor?: string[];
  favoritesFor?: string[];
  lastReadAt?: Record<string, Timestamp>;
}

/**
 * Message document structure
 */
export interface MessageDoc {
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  deliveredAt?: Timestamp;
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

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: {
    toDate: () => Date;
  };
  createdAt?: {
    toDate: () => Date;
  };
}

export interface ConversationItem {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: {
    toDate: () => Date;
  } | null;
  isMuted?: boolean;
  isFavorite?: boolean;
}

export interface MessageItemProps {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  createdAt?: {
    toDate: () => Date;
  }; 
  editedAt?: {
    toDate?: () => Date;
  };
  replyTo?: {
    id: string;
    text: string;
    senderId?: string;
  }|null;
  imageUrl?: string | null;
  isRead?: boolean;
  deliveredAt?: {
    toDate: () => Date;
  };
}

export interface ConfirmLogoutModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface Conversation {
  id: string;
  participants: string[];
}

export interface ChatContextType {
  /* ---------- CORE ---------- */
  messages: MessageItemProps[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  startConversation: (conversation: Conversation) => void;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
  /* ---------- COMPOSER STATE ---------- */
  replyTo: {
    id: string;
    text: string;
    senderId: string;
  } | null;
  editMessage: {
    id: string;
    text: string;
  } | null;
  setReplyTo: (msg: ChatContextType["replyTo"]) => void;
  setEditMessage: (msg: ChatContextType["editMessage"]) => void;
  clearComposerState: () => void;
}