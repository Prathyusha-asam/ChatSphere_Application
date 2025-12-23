/* eslint-disable react-hooks/static-components */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from "react";
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
import { UserProfile } from "@/types/firestore";
//region ChatHeader Component
/**
 * ChatHeader
 *
 * Displays the active conversation header.
 * - Shows other user's avatar, name, and online status
 * - Subscribes to conversation and user profile updates
 * - Provides chat actions (mute, favorite, clear, mark unread)
 *
 * @returns JSX.Element - Chat header UI
 */
export default function ChatHeader() {
  //region Hooks & State
  /**
   * Authentication, routing, and query params
   */
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("cid");
  /**
   * Local component state
   * - profile: other user's profile
   * - otherUserId: UID of the other participant
   * - menuOpen: action menu visibility
   * - loading: loading indicator
   * - isMuted: chat muted flag
   * - isFavorite: chat favorite flag
   */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  //endregion Hooks & State
  //region Firestore References
  /**
   * Reference to current conversation document
   */
  const convoRef = conversationId
    ? doc(db, "conversations", conversationId)
    : null;
  //endregion Firestore References
  //region MenuItem Component
  /**
   * MenuItem
   *
   * Reusable menu action item
   *
   * @param label - Menu label text
   * @param onClick - Click handler
   * @param danger - Marks destructive actions
   */
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
  //endregion MenuItem Component
  //region Load Conversation & User
  /**
   * Subscribes to conversation and other user's profile.
   * - Resolves other participant
   * - Reads mute and favorite flags
   * - Listens for real-time profile updates
   */
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
        /* read mute / favorite flags */
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
  //endregion Load Conversation & User
  //region Loading Guard
  /**
   * Loading state while resolving conversation and profile
   */
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);
  if (loading || !profile) {
    return (
      <div className="px-6 py-4 text-sm text-gray-500">
        Loading chat…
      </div>
    );
  }
  //endregion Loading Guard
  //region Actions
  /**
   * Marks conversation as unread for current user
   */
  const handleMarkAsUnread = async () => {
    if (!convoRef || !user) return;
    await updateDoc(convoRef, {
      [`lastReadAt.${user.uid}`]: null,
    });
    setMenuOpen(false);
  };
  /**
    * Toggles mute / unmute for the conversation
    */
  const handleMuteToggle = async () => {
    if (!convoRef || !user) return;
    await updateDoc(convoRef, {
      mutedFor: isMuted
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid),
    });
    setMenuOpen(false);
  };
  /**
     * Toggles favorite / unfavorite for the conversation
     */
  const handleFavoriteToggle = async () => {
    if (!convoRef || !user) return;
    await updateDoc(convoRef, {
      favoritesFor: isFavorite
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid),
    });
    setMenuOpen(false);
  };
  /**
    * Clears all messages in the current conversation
    */
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
  //endregion Actions
  //region Helpers
  /**
   * Formats user's last seen timestamp
   *
   * @param lastSeen - Firestore timestamp wrapper
   * @returns string - Formatted date or time
   */
  function formatLastSeen(lastSeen?: { toDate: () => Date }) {
    if (!lastSeen?.toDate) return "—";
    const lastSeenDate = lastSeen.toDate();
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    // Less than 24 hours → show time
    if (diffHours < 24) {
      return lastSeenDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // More than 24 hours → show date
    return lastSeenDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  //endregion Helpers
  //region Render
  /**
   * Renders chat header UI
   */
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
                  Last seen {formatLastSeen(profile.lastSeen)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* RIGHT → Menu */}
      <button
        ref={menuButtonRef}
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
          ref={menuRef}
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
  //endregion Render
}
//endregion ChatHeader Component
