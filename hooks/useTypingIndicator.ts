"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Listens to typing indicators in a conversation
 */
export function useTypingIndicator(
  conversationId: string,
  currentUserId: string
) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, "typingIndicators"),
      where("conversationId", "==", conversationId),
      where("userId", "!=", currentUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(
        (doc) => doc.data().userId as string
      );
      setTypingUsers(users);
    });

    return () => unsubscribe();
  }, [conversationId, currentUserId]);

  return typingUsers;
}
