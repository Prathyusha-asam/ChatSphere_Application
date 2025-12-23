/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserProfile } from "@/lib/firestore";
import ConversationSkeleton from "@/components/skeletons/ConversationsSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import StartConversation from "./StartConversation";
import Image from "next/image";
import { ConversationItem, UserProfile } from "@/types/firestore";

//region ConversationList Component
/**
 * ConversationList
 *
 * Displays the sidebar list of user conversations.
 * - Fetches conversations in real time
 * - Tracks unread message counts
 * - Supports favorites and mute indicators
 * - Handles search, delete, and navigation
 *
 * @returns JSX.Element - Conversation sidebar
 */
export default function ConversationList() {
  //region Hooks & State
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCid = searchParams.get("cid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  //endregion Hooks & State
  //region Context Menu State
  /**
   * Right-click context menu state
   */
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    conversationId: string;
  } | null>(null);
  //endregion Context Menu State
  //region Fetch Conversations
  /**
   * Fetches all conversations for the current user
   * and listens for real-time updates
   */
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list: ConversationItem[] = snap.docs
          .map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              participants: data.participants,
              lastMessage: data.lastMessage,
              lastMessageAt: data.lastMessageAt ?? null,
              isMuted: (data.mutedFor || []).includes(user.uid),
              isFavorite: (data.favoritesFor || []).includes(user.uid),
            };
          })
          .filter((c) => c.lastMessage?.trim());
        setConversations(list);
        setLoading(false);
      },
      (err) => {
        console.error("Conversation list error:", err);
        setError("Unable to load conversations.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);
  //endregion Fetch Conversations
  //region Unread Count
  /**
   * Tracks unread message count per conversation
   */
  useEffect(() => {
    if (!user || !conversations.length) return;
    const unsubscribers: (() => void)[] = [];
    conversations.forEach((conv) => {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conv.id),
        where("isRead", "==", false)
      );
      const unsub = onSnapshot(q, (snap) => {
        const unread = snap.docs.filter(
          (d) => d.data().senderId !== user.uid
        ).length;
        setUnreadCounts((prev) => ({
          ...prev,
          [conv.id]: unread,
        }));
      });
      unsubscribers.push(unsub);
    });
    return () => unsubscribers.forEach((u) => u());
  }, [conversations, user]);
  //endregion Unread Count
  //region Fetch User Profiles
  /**
   * Fetches profiles of conversation participants
   */
  useEffect(() => {
    conversations.forEach(async (c) => {
      const otherId = c.participants.find((p) => p !== user?.uid);
      if (!otherId || profiles[otherId]) return;
      const data = await getUserProfile(otherId);
      if (data) {
        setProfiles((prev) => ({
          ...prev,
          [otherId]: {
            displayName: data.displayName,
            photoURL: data.photoURL,
            userId: otherId,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen,
            createdAt: data.createdAt,
            email: data.email,
            id: data.id,
          },
        }));
      }
    });
  }, [conversations, profiles, user]);
  //endregion Fetch User Profiles
  //region Delete Conversation
  /**
   * Deletes a conversation and all its messages
   *
   * @param conversationId - ID of the conversation to delete
   */
  const deleteConversation = async (conversationId: string) => {
    try {
      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationId)
      );

      setUnreadCounts((prev) => {
        const copy = { ...prev };
        delete copy[conversationId];
        return copy;
      });

      setContextMenu(null);

      if (activeCid === conversationId) {
        router.push("/chat");
      }

      const msgsQuery = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId)
      );

      const msgsSnap = await getDocs(msgsQuery);
      await Promise.all(msgsSnap.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, "conversations", conversationId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete conversation");
    }
  };
  //endregion Delete Conversation
  //region Helpers
  /**
   * Formats date for last message timestamp
   */
  const formatDate = (date?: { toDate: () => Date } | null) => {
    if (!date) return "";
    const d = date.toDate();
    const diffMs = Date.now() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  };
  //endregion Helpers
  //region Search Filter
  /**
   * Filters conversations by participant name
   */
  const filteredConversations = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter((c) => {
      const otherId = c.participants.find((p) => p !== user?.uid) || "";
      const profile = profiles[otherId];
      return profile?.displayName
        ?.toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [conversations, profiles, search, user?.uid]);
  //endregion Search Filter
  //region Favorites Split
  const favoriteConversations = filteredConversations.filter(
    (c) => c.isFavorite
  );
  const normalConversations = filteredConversations.filter(
    (c) => !c.isFavorite
  );
  //endregion Favorites Split
  //region Navigation
  const openConversation = useCallback(
    (id: string) => router.push(`/chat?cid=${id}`),
    [router]
  );
  //endregion Navigation
  //region Guards
  if (loading) {
    return (
      <div className="w-80 bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-80 flex flex-col items-center justify-center px-4 text-center">
        <EmptyState
          title="Something went wrong"
          description={error}
          icon="/images/empty-state.svg"
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }
  if (!conversations.length) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <EmptyState
          title="No conversations yet"
          description="Start a new chat to begin messaging."
          icon="/images/empty-state.svg"
          actionLabel="Start new chat"
          onAction={() => setOpen(true)}
        />
        {open && <StartConversation onClose={() => setOpen(false)} />}
      </div>
    );
  }
  //endregion Guards
  //region Render
  /**
   * Renders conversation list UI
   */
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
      {/* Search */}
      <div className="p-3">
        <input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {favoriteConversations.length > 0 && (
          <>
            <p className="px-4 py-2 text-xs font-semibold text-gray-500">
              FAVOURITES
            </p>
            {favoriteConversations.map(renderRow)}
          </>
        )}
        <p className="px-4 py-2 text-xs font-semibold text-gray-500">
          CHATS
        </p>
        {normalConversations.map(renderRow)}
      </div>
      {/* New chat */}
      <div className="p-3 border-t">
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg bg-black py-2 text-sm text-white"
        >
          + New chat
        </button>
      </div>
      {open && <StartConversation onClose={() => setOpen(false)} />}
      {/* Context menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-40 rounded-lg border bg-white shadow-lg"
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            onClick={() => deleteConversation(contextMenu.conversationId)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
          >
            Delete conversation
          </button>
        </div>
      )}
    </div>
  );
  //endregion Render
  //region Row Renderer
  /**
   * Renders a single conversation row
   */
  function renderRow(c: ConversationItem) {
    const otherId = c.participants.find((p) => p !== user?.uid) || "";
    const profile = profiles[otherId];
    const unread = unreadCounts[c.id] || 0;
    return (
      <div
        key={c.id}
        onClick={() => openConversation(c.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({
            x: e.pageX,
            y: e.pageY,
            conversationId: c.id,
          });
        }}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b
          ${c.id === activeCid ? "bg-gray-100" : "hover:bg-gray-50"}`}
      >
        {profile?.photoURL ? (
          <Image
            src={profile.photoURL}
            className="w-9 h-9 rounded-full object-cover"
            alt="profile"
            width={16}
            height={16}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm">
            {profile?.displayName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium truncate">
              {profile?.displayName || "Loading"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {formatDate(c.lastMessageAt)}
              </span>
              {c.isMuted && (
                <Image
                  src="/images/mute.png"
                  className="w-6 h-6 opacity-60"
                  alt="mute"
                  width={20}
                  height={20}
                />
              )}
              {unread > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-black text-white text-xs flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 truncate">
            {c.lastMessage}
          </div>
        </div>
      </div>
    );
  }
  //endregion Row Renderer
}
//endregion ConversationList Component
