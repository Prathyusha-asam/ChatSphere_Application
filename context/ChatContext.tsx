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
import { sendMessage as sendMessageToDb } from "@/lib/sendMessage";
import { updateMessage } from "@/lib/messages";
import { Conversation, MessageItemProps,ChatContextType } from "@/types/firestore";
//region Context
/**
 * ChatContext
 *
 * Global chat state container
 */
export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);
//endregion Context
//region ChatProvider Component
/**
 * ChatProvider
 *
 * Provides real-time chat state and actions.
 * Responsibilities:
 * - Subscribe to messages in active conversation
 * - Track read/unread state
 * - Handle send, edit, reply flows
 * - Manage composer state
 *
 * @param children - Application subtree
 * @returns JSX.Element - Context provider
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  //region Dependencies
  const { user } = useAuth();
  //region State
  const [messages, setMessages] = useState<MessageItemProps[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] =
    useState<ChatContextType["replyTo"]>(null);
  const [editMessage, setEditMessage] =
    useState<ChatContextType["editMessage"]>(null);
  //endregion State
  //region Message Listener
  /**
   * Subscribes to messages of the active conversation
   * Updates in real time using Firestore snapshot listener
   */
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
        const msgs: MessageItemProps[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MessageItemProps, "id">),
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
  //endregion Message Listener
  //region Mark Messages As Read
  /**
   * Marks unread messages as read
   * Ensures:
   * - Only messages from other users are updated
   * - Read receipts are reliable and idempotent
   */
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
        console.error(" SEEN UPDATE FAILED:", err);
      }
    });
  }, [messages, currentConversation?.id, user?.uid]);
  //endregion Mark Messages As Read
  //region Actions
  /**
   * Sets active conversation
   *
   * @param conversation - Conversation to activate
   */
  const startConversation = (conversation: Conversation) => {
    setCurrentConversation((prev) =>
      prev?.id === conversation.id ? prev : conversation
    );
    setMessages([]);
    clearComposerState();
  };
  /**
    * Sends or edits a message
    *
    * @param text - Message text
    */
  const sendMessage = async (text: string) => {
    if (!user || !currentConversation) return;
    //  Edit existing message
    if (editMessage) {
      await updateMessage(
        currentConversation.id,
        editMessage.id,
        text
      );
      clearComposerState();
      return;
    }
    //  Send new message
    await sendMessageToDb(
      currentConversation.id,
      user.uid,
      text,
      replyTo
    );
    clearComposerState();
  };
  /**
     * Clears active conversation
     */
  const clearConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    clearComposerState();
  };
  /**
    * Clears reply/edit composer state
    */
  const clearComposerState = () => {
    setReplyTo(null);
    setEditMessage(null);
  };
  //endregion Actions
  //region Provider Render
  /**
   * Exposes chat state and actions
   */
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
  //endregion Provider Render
}
//endregion ChatProvider Component
//region useChat Hook
/**
 * useChat
 *
 * Safe hook for accessing chat context.
 * Must be used inside ChatProvider.
 *
 * @returns ChatContextType
 */
export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
}
//endregion useChat Hook