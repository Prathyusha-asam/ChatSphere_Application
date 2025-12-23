import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/types/firestore";
export function useUserPresence() {
  //region State Management
  /**
   * Stores list of users with presence information
   */
  const [users, setUsers] = useState<UserProfile[]>([]);
  //endregion
  //region User Presence Effect
  useEffect(() => {
    //region Auth Validation
    /**
     * Prevents Firestore subscription until auth is ready
     */
    if (!auth.currentUser) return;
    //endregion
    //region Firestore Query
    /**
     * Queries all users for presence tracking
     */
    const q = query(collection(db, "users"));
    //endregion
    //region Real-time Listener
    /**
     * Subscribes to real-time user presence updates
     */
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        //region Map & Process User Data
        /**
         * Maps Firestore documents to PresenceUser objects,
         * hides current user, and sorts online users first
         */
        const list: UserProfile[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<UserProfile, "id">),
          }))
          .filter((u) => u.userId !== auth.currentUser?.uid)
          .sort((a, b) => Number(b.isOnline) - Number(a.isOnline));
        //endregion
        setUsers(list);
      },
      (error) => {
        //region Error Handling
        /**
         * Handles Firestore presence listener errors
         */
        console.error("Presence listener error:", error);
        //endregion
      }
    );
    //endregion
    //region Return Hook Data
    /**
     * Returns list of users with presence status
     */
    return () => unsubscribe();
  }, []);
  //endregion
  //region Return Hook Data
  /**
   * Returns list of users with presence status
   */
  return users;
  //endregion
}

