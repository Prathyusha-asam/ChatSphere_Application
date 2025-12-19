/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { sendMessage as sendMessageToDb } from "@/lib/sendMessage";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Conversation {
  id: string;
  participants: string[];
}

export interface ChatContextType {
  messages: Message[];
  currentConversation: Conversation | null;
  loading: boolean;
  startConversation: (conversation: Conversation) => void;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentConversation) return;

    setLoading(true);

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", currentConversation.id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      setMessages(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentConversation]);

  const startConversation = (conversation: Conversation) => {
    setCurrentConversation((prev) =>
      prev?.id === conversation.id ? prev : conversation
    );
    setMessages([]);
  };

  const sendMessage = async (text: string) => {
    if (!user || !currentConversation) return;
    await sendMessageToDb(
      currentConversation.id,
      user.uid,
      text
    );
  };

  const clearConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        currentConversation,
        loading,
        startConversation,
        sendMessage,
        clearConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
}
