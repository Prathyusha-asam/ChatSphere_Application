/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";

interface UserProfile {
  displayName: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: {
    toDate: () => Date;
  };
}

export default function ChatHeader() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("cid");

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    const convoRef = doc(db, "conversations", conversationId);

    const unsubscribeConversation = onSnapshot(convoRef, (snap) => {
      if (!snap.exists()) return;

      const participants: string[] = snap.data().participants || [];
      const otherUserId = participants.find((uid) => uid !== user.uid);
      if (!otherUserId) return;

      const userRef = doc(db, "users", otherUserId);

      const unsubscribeUser = onSnapshot(userRef, (userSnap) => {
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        }
      });

      return () => unsubscribeUser();
    });

    return () => unsubscribeConversation();
  }, [conversationId, user]);

  if (!profile) return null;

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">

      {/* Avatar */}
      {profile.photoURL ? (
        <img
          src={profile.photoURL}
          alt="Avatar"
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
          {profile.displayName?.[0]?.toUpperCase()}
        </div>
      )}

      {/* User Info */}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-gray-900">
          {profile.displayName}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {profile.isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>
                Last seen{" "}
                {profile.lastSeen?.toDate
                  ? profile.lastSeen
                      .toDate()
                      .toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                  : "—"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
