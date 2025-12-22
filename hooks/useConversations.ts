"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Conversation } from "@/types/conversation.types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeConversations: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.uid),
        orderBy("lastMessageAt", "desc") // ✅ FIXED
      );

      unsubscribeConversations = onSnapshot(
        q,
        (snapshot) => {
          const data: Conversation[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Conversation, "id">),
          }));

          setConversations(data);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError("Failed to load conversations");
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeConversations?.();
    };
  }, []);

  return { conversations, loading, error };
}
