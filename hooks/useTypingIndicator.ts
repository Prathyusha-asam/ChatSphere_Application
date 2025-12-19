/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useTypingIndicator(
  conversationId?: string,
  currentUserId?: string
) {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (
      !conversationId ||
      !currentUserId ||
      conversationId.trim().length === 0
    ) {
      setTypingUserIds([]);
      return;
    }

    const q = query(
      collection(db, "typingIndicators"),
      where("conversationId", "==", conversationId),
      where("isTyping", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs
          .map((d) => d.data().userId)
          .filter((uid) => uid && uid !== currentUserId);

        setTypingUserIds(users);
      },
      () => {
        setTypingUserIds([]);
      }
    );

    return () => unsubscribe();
  }, [conversationId, currentUserId]);

  return typingUserIds;
}
