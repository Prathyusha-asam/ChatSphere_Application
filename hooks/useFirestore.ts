/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
export function useFirestore(conversationId: string) {
  //region State Management
  /**
   * Manages messages, loading state, and error state for a conversation
   */
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //endregion
  //region Load Messages
  useEffect(() => {
    //region Early Return
    /**
     * Skip loading if no conversation ID
     */
    if (!conversationId) {
      setLoading(false);
      return;
    }
    //endregion
    //region Setup Real-time Listener
    /**
     * Sets up Firestore listener for messages in the specified conversation
     */
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc")
    );
    //endregion
    //region Real-time Snapshot Listener
    /**
     * Subscribes to real-time updates of messages
     */
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        //region Map Messages
        /**
         * Maps Firestore documents to message objects
         */
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //endregion
        setMessages(msgs);
        setLoading(false);
      },
      () => {
        //region Handle Snapshot Error
        /**
         * Handles errors during snapshot listening
         */
        setError("Failed to load messages");
        setLoading(false);
        //endregion
      }
    );
    //endregion
    //region Cleanup Listener
    /**
     * Cleans up the Firestore listener on unmount
     */
    return () => unsubscribe();
  }, [conversationId]);
  //endregion
  // region return Messages
  /**
   * Returns messages, loading state, and error state
   */
  return { messages, loading, error };
  // endregion
}

