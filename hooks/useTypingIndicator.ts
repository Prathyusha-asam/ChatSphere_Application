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
 
/**

* useTypingIndicator

*

* Listens to real-time typing indicators for a conversation.

* Returns userIds of OTHER users currently typing.

*

* ✅ No client-time logic

* ✅ Firestore is the source of truth

* ✅ Works consistently in production

*/

export function useTypingIndicator(

  conversationId?: string,

  currentUserId?: string

) {

  // -------------------- STATE --------------------

  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
 
  // -------------------- EFFECT --------------------

  useEffect(() => {

    // Guard: invalid state

    if (!conversationId || !currentUserId) {

      setTypingUserIds([]);

      return;

    }
 
    // Firestore query

    const q = query(

      collection(db, "typingIndicators"),

      where("conversationId", "==", conversationId),

      where("isTyping", "==", true)

    );
 
    // Real-time listener

    const unsubscribe = onSnapshot(

      q,

      (snapshot) => {

        const users = snapshot.docs

          .map((doc) => {

            const data = doc.data();
 
            // Exclude self

            if (data.userId === currentUserId) return null;
 
            return data.userId as string;

          })

          .filter(Boolean) as string[];
 
        setTypingUserIds(users);

      },

      (error) => {

        console.error("Typing indicator listener error:", error);

        setTypingUserIds([]);

      }

    );
 
    // Cleanup

    return () => unsubscribe();

  }, [conversationId, currentUserId]);
 
  // -------------------- RETURN --------------------

  return typingUserIds;

}

 