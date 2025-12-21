import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Conversation } from "@/types/conversation.types";

export function useConversations(currentUserId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const loadConversations = async () => {
      try {
        // ✅ collection name matches rules
        const q = query(
          collection(db, "conversation"),
          where("participants", "array-contains", currentUserId)
        );

        const snapshot = await getDocs(q);

        const convs: Conversation[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            // ✅ participants are userIds (rules-safe)
            participants: data.participants,
            lastMessage: data.lastMessage ?? "",
            lastMessageTime: data.lastMessageTime
              ?.toDate()
              .toISOString() ?? new Date().toISOString(),
          };
        });

        setConversations(convs);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUserId]);

  return { conversations, loading };
}
