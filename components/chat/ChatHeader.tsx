/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";

/* ---------- Types ---------- */
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
  const router = useRouter();
  const conversationId = searchParams.get("cid");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* 🔹 ADDED STATE */
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const convoRef = conversationId
    ? doc(db, "conversations", conversationId)
    : null;

  /* ---------- Menu Item ---------- */
  function MenuItem({
    label,
    onClick,
    danger = false,
  }: {
    label: string;
    onClick: () => void;
    danger?: boolean;
  }) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition
        ${danger ? "text-red-600" : "text-gray-800"}`}
      >
        {label}
      </button>
    );
  }

  /* ---------- Load conversation + user ---------- */
  useEffect(() => {
    if (!conversationId || !user) return;

    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeConversation = onSnapshot(
      doc(db, "conversations", conversationId),
      (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();
        const participants: string[] = data.participants || [];
        const uid = participants.find((p) => p !== user.uid);
        if (!uid) return;

        setOtherUserId(uid);

        /* 🔹 read mute / favorite flags */
        setIsMuted((data.mutedFor || []).includes(user.uid));
        setIsFavorite((data.favoritesFor || []).includes(user.uid));

        if (unsubscribeUser) unsubscribeUser();

        unsubscribeUser = onSnapshot(doc(db, "users", uid), (userSnap) => {
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          }
          setLoading(false);
        });
      }
    );

    return () => {
      unsubscribeConversation();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [conversationId, user]);

  if (loading || !profile) {
    return (
      <div className="px-6 py-4 text-sm text-gray-500">
        Loading chat…
      </div>
    );
  }

  /* ---------- ACTIONS ---------- */

  // ✅ MARK AS UNREAD
  const handleMarkAsUnread = async () => {
    if (!convoRef || !user) return;

    await updateDoc(convoRef, {
      [`lastReadAt.${user.uid}`]: null,
    });

    setMenuOpen(false);
  };

  // 🔕 MUTE / UNMUTE
  const handleMuteToggle = async () => {
    if (!convoRef || !user) return;

    await updateDoc(convoRef, {
      mutedFor: isMuted
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid),
    });

    setMenuOpen(false);
  };

  // ⭐ FAVORITE / UNFAVORITE
  const handleFavoriteToggle = async () => {
    if (!convoRef || !user) return;

    await updateDoc(convoRef, {
      favoritesFor: isFavorite
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid),
    });

    setMenuOpen(false);
  };

  // 🧹 CLEAR ALL CHATS (THIS CONVERSATION)
  const handleClearChat = async () => {
    if (!conversationId) return;

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId)
    );

    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));

    await updateDoc(convoRef!, {
      lastMessage: "",
      lastMessageAt: null,
    });

    setMenuOpen(false);
  };

  return (
    <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">

      {/* LEFT → Profile */}
      <div
        onClick={() => router.push(`/profile/${otherUserId}`)}
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1"
      >
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

        {/* User info */}
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

      {/* RIGHT → Menu */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((p) => !p);
        }}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-6 top-full mt-2 w-56 rounded-xl border bg-white shadow-lg z-50"
        >
          <MenuItem label="Mark as unread" onClick={handleMarkAsUnread} />
          <MenuItem
            label={isMuted ? "Unmute chat" : "Mute chat"}
            onClick={handleMuteToggle}
          />
          <MenuItem
            label={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
            onClick={handleFavoriteToggle}
          />

          <div className="border-t my-1" />

          <MenuItem
            label="Clear all chats"
            danger
            onClick={handleClearChat}
          />
        </div>
      )}
    </div>
  );
}
