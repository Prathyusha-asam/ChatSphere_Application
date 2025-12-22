/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { createConversation } from "@/lib/conversations";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  displayName?: string;
  photoURL?: string;
}

export default function StartConversation({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Load users ---------- */
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "users"));
        const list: User[] = [];

        snap.forEach((doc) => {
          const data = doc.data() as User;
          if (data.userId && data.userId !== user?.uid) {
            list.push(data);
          }
        });

        setUsers(list);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [user]);

  /* ---------- NT-29: memoized filter ---------- */
  const filtered = useMemo(() => {
    return users.filter((u) =>
      (u.displayName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  /* ---------- NT-29: memoized start chat (MERGED) ---------- */
  const startChat = useCallback(
    async (otherUserId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        setError("");

        const cid = await createConversation(
          user.uid,
          otherUserId
        );

        onClose();
        router.push(`/chat?cid=${cid}`);
      } catch (err) {
        console.error("Start conversation failed:", err);
        setError("Unable to start chat. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [user, onClose, router]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal */}
      <div className="w-full max-w-sm rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900">
            Start a new chat
          </h2>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            className="w-full rounded-lg border border-gray-300 bg-white
                       px-3 py-2 text-sm text-gray-900
                       placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="px-4 pb-2 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* User list */}
        <div className="max-h-64 overflow-y-auto px-2 pb-2">
          {filtered.length === 0 && !loading && (
            <p className="px-3 py-4 text-sm text-gray-500 text-center">
              No users found
            </p>
          )}

          {filtered.map((u) => (
            <button
              key={`user-${u.userId}`}
              onClick={() => startChat(u.userId)}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2
                         hover:bg-gray-100 transition text-left
                         disabled:opacity-60"
            >
              {/* Avatar */}
              {u.photoURL ? (
                <img
                  src={u.photoURL}
                  className="h-9 w-9 rounded-full object-cover"
                  alt="Avatar"
                  loading="lazy"
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center
                             rounded-full bg-gray-900 text-sm
                             font-medium text-white"
                >
                  {(u.displayName || "U")[0].toUpperCase()}
                </div>
              )}

              {/* Name */}
              <span className="text-sm text-gray-900 truncate">
                {u.displayName || "Unnamed user"}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300
                       py-2 text-sm font-medium text-gray-700
                       hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
