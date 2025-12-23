import { useEffect, useState } from "react";
import { collection, getDocs, query, where, } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Conversation } from "@/types/conversation.types";
export function useConversations(currentUserId: string) {
  //region State Management
  /**
   * Manages conversations and loading state
   */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  //endregion
  //region Load Conversations
  useEffect(() => {
    //region Early Return
    /**
     * Skip loading if no current user ID
     */
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    //endregion
    //region Fetch Conversations
    /**
     * Fetches conversations involving the current user
     */
    const loadConversations = async () => {
      try {
        //region Query Setup
        /**
         * Constructs query for conversations with current user
         */
       const q = query(
  collection(db, "conversations"),
  where("participants", "array-contains", currentUserId)
);

        //endregion
        const snapshot = await getDocs(q);
        //region Map Conversations
        /**
         * Maps Firestore documents to Conversation objects
         */
        const convs: Conversation[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            participants: data.participants,
            lastMessage: data.lastMessage ?? "",
            lastMessageTime: data.lastMessageTime
              ?.toDate()
              .toISOString() ?? new Date().toISOString(),
          };
        });
        //endregion
        setConversations(convs);
      } finally {
        //region Finalize Loading
        /**
         * Marks loading as complete
         */
        setLoading(false);
      }
    };
    //endregion
    loadConversations();
  }, [currentUserId]);
  //endregion
  // region return Conversations
  /**
   * Returns conversations and loading state
   */
  return { conversations, loading };
  // endregion
}

