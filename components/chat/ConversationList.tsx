"use client";

import { useEffect, useMemo, useState } from "react";
import { Conversation } from "@/types/conversation.types";
import { getUserProfile } from "@/lib/firestore";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading?: boolean;
  error?: string | null;
};

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  loading = false,
  error = null,
}: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [nameCache, setNameCache] = useState<Record<string, string>>({});

  /* ---------------- Resolve participant names ---------------- */
  useEffect(() => {
    async function loadNames() {
      const ids = new Set<string>();

      conversations.forEach((c) =>
        c.participants.forEach((id) => {
          if (id !== user?.uid && !nameCache[id]) ids.add(id);
        })
      );

      const entries = await Promise.all(
        [...ids].map(async (uid) => {
          const profile = await getUserProfile(uid);
          return [uid, profile?.displayName || "Unknown"] as const;
        })
      );

      if (entries.length) {
        setNameCache((prev) => ({
          ...prev,
          ...Object.fromEntries(entries),
        }));
      }
    }

    if (user) loadNames();
  }, [conversations, user]);

  /* ---------------- Search filter ---------------- */
  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const names = c.participants
        .filter((p) => p !== user?.uid)
        .map((p) => nameCache[p] || "")
        .join(" ")
        .toLowerCase();

      return names.includes(search.toLowerCase());
    });
  }, [conversations, search, nameCache, user]);

  /* ---------------- States ---------------- */
  if (loading) {
    return (
      <aside className="w-80 border-r flex items-center justify-center text-gray-500">
        Loading conversations...
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-80 border-r flex items-center justify-center text-red-500">
        {error}
      </aside>
    );
  }

  if (!conversations.length) {
    return (
      <aside className="w-80 border-r flex items-center justify-center text-gray-400">
        No conversations yet
      </aside>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <aside className="w-80 border-r flex flex-col bg-white">
      {/* Search */}
      <input
        type="text"
        placeholder="Search conversations"
        className="m-3 p-2 border rounded focus:ring-2 focus:ring-purple-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 mt-6">
            No conversations match your search
          </p>
        )}

        {filtered.map((conv) => {
          const isActive = conv.id === activeConversationId;

          const otherNames = conv.participants
            .filter((p) => p !== user?.uid)
            .map((p) => nameCache[p] || "Loading...")
            .join(", ");

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-4 cursor-pointer border-b hover:bg-gray-100 transition
                ${isActive ? "bg-purple-100" : ""}`}
            >
              {/* Names */}
              <div className="font-medium truncate">
                {otherNames}
              </div>

              {/* Last message */}
              <div className="text-sm text-gray-600 truncate">
                {conv.lastMessage || "No messages yet"}
              </div>

              {/* Time */}
              {conv.lastMessageAt && (
                <div className="text-xs text-gray-400 mt-1">
                  {conv.lastMessageAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
