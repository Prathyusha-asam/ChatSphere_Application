/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { sendMessage as sendMessageToDb } from "@/lib/firestore";
import { updateMessage } from "@/lib/messages";

/* =========================================================
   TYPES
========================================================= */

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  editedAt?: any;
  replyTo?: {
    id: string;
    text: string;
    senderId?: string;
  };
  isRead?: boolean;
  deliveredAt?: any;
}

export interface Conversation {
  id: string;
  participants: string[];
}

export interface ChatContextType {
  messages: Message[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;

  startConversation: (conversation: Conversation) => void;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;

  replyTo: {
    id: string;
    text: string;
    senderId?: string;
  } | null;

  editMessage: {
    id: string;
    text: string;
  } | null;

  setReplyTo: (msg: ChatContextType["replyTo"]) => void;
  setEditMessage: (msg: ChatContextType["editMessage"]) => void;
  clearComposerState: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

/* =========================================================
   PROVIDER
========================================================= */

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [replyTo, setReplyTo] = useState<ChatContextType["replyTo"]>(null);

  const [editMessage, setEditMessage] =
    useState<ChatContextType["editMessage"]>(null);

  /* =========================================================
     LISTEN FOR MESSAGES
========================================================= */

  useEffect(() => {
    if (!currentConversation) return;

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", currentConversation.id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Message, "id">),
        }));

        setMessages(msgs);
        setLoading(false);
      },
      () => {
        setError("Failed to load messages");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentConversation]);

  /* =========================================================
   ✅ MARK MESSAGES AS SEEN (FINAL, GUARANTEED)
   ========================================================= */

useEffect(() => {
  if (!user || !currentConversation) return;
  if (!messages.length) return;

  const unreadMessages = messages.filter(
    (msg) =>
      msg.senderId !== user.uid &&
      msg.isRead !== true
  );

  if (!unreadMessages.length) return;

  unreadMessages.forEach(async (msg) => {
    try {
      await updateDoc(doc(db, "messages", msg.id), {
        isRead: true,
      });
    } catch (err) {
      console.error("🔥 SEEN UPDATE FAILED:", err);
    }
  });
}, [messages, currentConversation?.id, user?.uid]);



  /* =========================================================
     ACTIONS
========================================================= */

  const startConversation = (conversation: Conversation) => {
    setCurrentConversation((prev) =>
      prev?.id === conversation.id ? prev : conversation
    );
    setMessages([]);
    clearComposerState();
  };

  const sendMessage = async (text: string) => {
    if (!user || !currentConversation) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    /*  EDIT MESSAGE (WhatsApp-style) */
    /*  EDIT MESSAGE */
    if (editMessage) {
      await updateMessage(
        currentConversation.id, //  FIX
        editMessage.id,
        trimmed
      );

      clearComposerState();
      return;
    }

    /* NEW MESSAGE (with reply support) */
    await sendMessageToDb(currentConversation.id, user.uid, trimmed, replyTo);

    clearComposerState();
  };

  const clearConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    clearComposerState();
  };

  const clearComposerState = () => {
    setReplyTo(null);
    setEditMessage(null);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        currentConversation,
        loading,
        error,
        startConversation,
        sendMessage,
        clearConversation,
        replyTo,
        editMessage,
        setReplyTo,
        setEditMessage,
        clearComposerState,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

/* =========================================================
   SAFE HOOK
========================================================= */

export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
}
