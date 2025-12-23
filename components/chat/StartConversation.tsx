/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { createConversation } from "@/lib/conversations";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { UserProfile } from "@/types/firestore";
//region StartConversation Component
/**
 * StartConversation
 *
 * Modal for initiating a new one-to-one chat.
 * - Loads all users from Firestore (excluding current user)
 * - Supports searching users by display name
 * - Creates or reuses a conversation
 * - Redirects to chat on success
 *
 * @param onClose - Callback to close the modal
 * @returns JSX.Element - Start conversation modal
 */
export default function StartConversation({
  onClose,
}: {
  onClose: () => void;
}) {
  //region Hooks & State
  /**
   * Authentication, routing, and local state
   */
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  //endregion Hooks & State
  //region Load Users
  /**
   * Fetches all users from Firestore excluding the current user
   */
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");
        const snap = await getDocs(collection(db, "users"));
        const list: UserProfile[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as UserProfile;
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
  //endregion Load Users
  //region Search Filter
  /**
   * Filters users by display name (case-insensitive)
   */
  const filtered = useMemo(() => {
    return users.filter((u) =>
      (u.displayName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);
  //endregion Search Filter
  //region Start Chat
  /**
   * Creates or retrieves a conversation and navigates to it
   *
   * @param otherUserId - Selected user ID
   */
  const startChat = useCallback(
    async (otherUserId: string) => {
      if (!user) return;
      try {
        setLoading(true);
        setError("");
        const cid = await createConversation(user.uid, otherUserId);
        onClose();
        router.push(`/chat?cid=${cid}`);
      } catch (err) {
        console.error("Start conversation failed:", err);
        setError("Unable to start chat. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [user, router, onClose]
  );
  //endregion Start Chat
  //region Render
  /**
   * Renders modal UI for starting a new conversation
   */
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
          {!loading && filtered.length === 0 && (
            <EmptyState
              title="No users found"
              description="Try searching with a different name."
              icon="/images/no-users.svg"
            />
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
  //endregion Render
}
//endregion StartConversation Component
