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
        setLoading(false); // ✅ inside callback (allowed)
        return;
      }

      const q = query(
        collection(db, "conversation"),
        where("participants", "array-contains", user.uid),
        orderBy("lastMessageTime", "desc")
      );

      unsubscribeConversations = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Conversation[];

          setConversations(data);
          setLoading(false); // ✅ callback
        },
        (err) => {
          console.error(err);
          setError("Failed to load conversations");
          setLoading(false); // ✅ callback
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
