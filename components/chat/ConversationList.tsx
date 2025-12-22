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
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserProfile } from "@/lib/firestore";
import StartConversation from "./StartConversation";
import ConversationSkeleton from "@/components/skeletons/ConversationsSkeleton";

/* ---------- Types ---------- */
interface ConversationItem {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: {
    toDate: () => Date;
  } | null;
}

interface UserProfile {
  displayName: string;
  photoURL?: string;
}

export default function ConversationList() {
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

  /* ---------- Fetch conversations ---------- */
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
      (snap: QuerySnapshot<DocumentData>) => {
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }))
          .filter((c) => c.lastMessage?.trim());

        setConversations(list);
        setLoading(false);
      },
      (err) => {
        console.error("Conversation list error:", err);
        setError("Unable to load conversations. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /* ---------- Fetch user profiles ---------- */
  useEffect(() => {
    conversations.forEach(async (c) => {
      const otherId = c.participants.find((p) => p !== user?.uid);
      if (!otherId || profiles[otherId]) return;

      try {
        const data = await getUserProfile(otherId);
        if (data) {
          setProfiles((prev) => ({
            ...prev,
            [otherId]: {
              displayName: data.displayName,
              photoURL: data.photoURL,
            },
          }));
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    });
  }, [conversations, profiles, user]);

  /* ---------- WhatsApp-style date formatter ---------- */
  const formatDate = (date?: { toDate: () => Date } | null) => {
    if (!date) return "";

    const d = date.toDate();
    const now = new Date();

    const isToday = d.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString();
  };

  /* ---------- Search filter ---------- */
  const filteredConversations = useMemo(() => {
    if (!search) return conversations;

    return conversations.filter((c) => {
      const otherId = c.participants.find((p) => p !== user?.uid) || "";
      const profile = profiles[otherId];

      return (
        profile?.displayName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ?? true
      );
    });
  }, [conversations, profiles, search, user?.uid]);

  const handleOpenConversation = useCallback(
    (id: string) => {
      router.push(`/chat?cid=${id}`);
    },
    [router]
  );

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="w-80 bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="w-80 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ---------- Empty state ---------- */
  if (!conversations.length) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-center px-4">
        <p className="text-sm text-gray-500 mb-4">
          No conversations yet
        </p>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          Start new chat
        </button>

        {open && <StartConversation onClose={() => setOpen(false)} />}
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col">

      {/* Search */}
      <div className="p-3">
        <input
          placeholder="Search"
          className="w-full rounded-lg border border-gray-300 bg-white
                     px-3 py-2 text-sm text-gray-900
                     placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {filteredConversations.map((c) => {
          const otherId =
            c.participants.find((p) => p !== user?.uid) || "";
          const profile = profiles[otherId];

          return (
            <div
              key={c.id}
              onClick={() => handleOpenConversation(c.id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100
                ${c.id === activeCid ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              {/* Avatar */}
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  className="w-9 h-9 rounded-full object-cover"
                  alt="Avatar"
                  loading="lazy"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-900 text-white
                                flex items-center justify-center text-sm font-medium">
                  {profile?.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile?.displayName || "Loading"}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatDate(c.lastMessageAt)}
                  </span>
                </div>

                <div className="text-xs text-gray-500 truncate">
                  {c.lastMessage || "No messages yet"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg bg-black py-2 text-sm font-medium
                     text-white hover:bg-gray-800 transition"
        >
          + New chat
        </button>
      </div>

      {open && <StartConversation onClose={() => setOpen(false)} />}
    </div>
  );
}
