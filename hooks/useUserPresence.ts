import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

export interface PresenceUser {
  id: string;
  userId: string;
  displayName: string;
  isOnline: boolean;
  photoURL?: string;
}

export function useUserPresence() {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    // 🔒 DO NOT subscribe until auth is ready
    if (!auth.currentUser) return;

    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PresenceUser[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<PresenceUser, "id">),
          }))
          // 🔹 ADDED: hide current logged-in user
          .filter((u) => u.userId !== auth.currentUser?.uid)
          // 🔹 ADDED: online users first (UX improvement)
          .sort((a, b) => Number(b.isOnline) - Number(a.isOnline));

        setUsers(list);
      },
      (error) => {
        console.error("Presence listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return users;
}
