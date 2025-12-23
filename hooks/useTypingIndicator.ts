/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, } from "firebase/firestore";
import { db } from "@/lib/firebase";
export function useTypingIndicator(
  conversationId?: string,
  currentUserId?: string
) {
  //region State Management
  /**
   * Manages typing user IDs for a conversation
   */
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  //endregion
  //region Load Typing Indicators
  useEffect(() => {
    //region Early Return
    /**
     * Skip loading if no conversation ID or current user ID
     */
    if (
      !conversationId ||
      !currentUserId ||
      conversationId.trim().length === 0
    ) {
      setTypingUserIds([]);
      return;
    }
    //endregion
    //region Setup Real-time Listener
    /**
     * Sets up Firestore listener for typing indicators in the specified conversation
     */
    const q = query(
      collection(db, "typingIndicators"),
      where("conversationId", "==", conversationId),
      where("isTyping", "==", true)
    );
    //endregion
    //region Real-time Snapshot Listener
    /**
     * Subscribes to real-time updates of typing indicators
     */
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        //region Process Typing Users
        /**
         * Processes snapshot to extract typing user IDs excluding the current user
         */
        const now = Date.now();
        const users = snapshot.docs
          .map((d) => {
            const data = d.data();
            const updatedAt =
              data.updatedAt?.toDate?.() ||
              data.createdAt?.toDate?.();
            if (!updatedAt) return null;
            const diffMs = now - updatedAt.getTime();
            if (diffMs > 3000) return null;
            if (data.userId === currentUserId) return null;
            return data.userId as string;
          })
          .filter(Boolean) as string[];
        //endregion
        setTypingUserIds(users);
      },
      () => {
        //region Error Handling
        /**
         * Clears typing state on listener error
         */
        setTypingUserIds([]);
        //endregion
      }
    );
    //endregion
    //region cleanup
    /**
    * Unsubscribes Firestore listener on unmount or dependency change
    */
    return () => unsubscribe();
    //endregion
  }, [conversationId, currentUserId]);
  //endregion
  //region Return Hook Data
  /**
   * Returns list of userIds currently typing
   */
  return typingUserIds;
  //endregion
}

