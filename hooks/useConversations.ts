"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Conversation } from "@/types/conversation.types";
export function useConversations() {
  //region State Management
  /**
   * Manages conversations, loading state, and error state
   */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //endregion
  //region Load Conversations with Real-time Updates
  useEffect(() => {
    //region Initialize Unsubscribe
    /**
     * Sets up real-time listener for conversations of the authenticated user
     */
    let unsubscribeConversations: (() => void) | undefined;
    //endregion
    //region Auth State Change Listener
    /**
     * Listens for authentication state changes
     */
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      //region Handle No User
      /**
       * Clears conversations if no user is authenticated
       */
      if (!user) {
        setConversations([]);
        setLoading(false);
        return;
      }
      //endregion
      //region Setup Conversations Listener
      /**
       * Sets up Firestore listener for conversations involving the authenticated user
       */
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.uid),
        orderBy("lastMessageAt", "desc")
      );
      //endregion
      //region Real-time Snapshot Listener
      /**
       * Subscribes to real-time updates of conversations
       */
      unsubscribeConversations = onSnapshot(
        q,
        (snapshot) => {
          //region Map Snapshot Data
          /**
           * Maps Firestore documents to Conversation objects
           */
          const data: Conversation[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Conversation, "id">),
          }));
          //endregion
          setConversations(data);
          setLoading(false);
        },
        (err) => {
          //region Handle Snapshot Error
          /**
           * Handles errors during snapshot listening
           */
          console.error(err);
          setError("Failed to load conversations");
          setLoading(false);
          //endregion
        }
      );
      //endregion
    });
    //endregion
    //region Cleanup Subscriptions
    /**
     * Cleans up authentication and conversation listeners on unmount
     */
    return () => {
      unsubscribeAuth();
      unsubscribeConversations?.();
    };
    //endregion
  }, []);
  //endregion
  // region return Conversations
  /**
   * Returns conversations and loading state
   */
  return { conversations, loading, error };
  // endregion
}
