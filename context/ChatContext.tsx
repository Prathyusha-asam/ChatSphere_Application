"use client";

import {
    createContext, useEffect, useState, ReactNode
} from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

/* =======================
   Types
======================= */

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

export interface ChatUser {
    userId: string;
    displayName: string;
    photoURL?: string;
}

/* =======================
   Context Shape
======================= */

export interface ChatContextType {
    messages: Message[];
    currentConversation: Conversation | null;
    participants: ChatUser[];
    loading: boolean;
    error: string | null;

    // Actions
    startConversation: (conversation: Conversation) => void;
    sendMessage: (text: string) => Promise<void>;
    clearConversation: () => void;
}

/* =======================
   Create Context
======================= */

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

/* =======================
   Provider
======================= */

export function ChatProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [currentConversation, setCurrentConversation] =
        useState<Conversation | null>(null);
    const [participants, setParticipants] = useState<ChatUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /* =======================
       Load messages in realtime
    ======================= */

    useEffect(() => {
        if (!currentConversation) return;

        setLoading(true);

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

    /* =======================
       Actions
    ======================= */

    const startConversation = (conversation: Conversation) => {
  setCurrentConversation((prev) => {
    if (prev?.id === conversation.id) {
      return prev;
    }
    return conversation;
  });

  setMessages([]); // reset safely
  setError(null);
};




    const sendMessage = async (text: string) => {
        if (!user || !currentConversation) return;

        console.log("Sending message:", {
            conversationId: currentConversation.id,
            senderId: user.uid,
            text,
        });

        try {
            await addDoc(collection(db, "messages"), {
                conversationId: currentConversation.id,
                senderId: user.uid,
                text,
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            console.error(err);
            setError("Failed to send message");
        }
    };


    const clearConversation = () => {
        setCurrentConversation(null);
        setMessages([]);
        setParticipants([]);
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                currentConversation,
                participants,
                loading,
                error,
                startConversation,
                sendMessage,
                clearConversation,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}
