"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useTypingIndicator(
  conversationId: string,
  currentUserId: string
) {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const q = query(
      collection(db, "typingIndicators"),
      where("conversationId", "==", conversationId),
      where("isTyping", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map((doc) => doc.data().userId)
        .filter((uid) => uid !== currentUserId); // ❗ exclude self

      setTypingUserIds(users);
    });

    return () => unsubscribe();
  }, [conversationId, currentUserId]);

  return typingUserIds;
}
