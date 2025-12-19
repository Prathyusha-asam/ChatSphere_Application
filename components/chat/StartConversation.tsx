"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { createConversation } from "@/lib/conversations";
import { useRouter } from "next/navigation";

/* ---------- Types ---------- */
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

  /* ---------- Load Users ---------- */
  useEffect(() => {
    async function loadUsers() {
      const snapshot = await getDocs(collection(db, "users"));

      const list = snapshot.docs
        .map((doc) => doc.data() as User)
        .filter((u) => u.userId !== user?.uid);

      setUsers(list);
    }

    loadUsers();
  }, [user]);

  /* ---------- Safe Search ---------- */
  const filtered = users.filter((u) =>
    (u.displayName || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ---------- Start Chat ---------- */
  const startChat = async (otherUserId: string) => {
    if (!user) return;

    const conversationId = await createConversation(
      user.uid,
      otherUserId
    );

    onClose();
    router.push(`/chat?cid=${conversationId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded-lg shadow-lg p-4">
        <h2 className="font-semibold text-lg mb-3">
          New Chat
        </h2>

        <input
          placeholder="Search users"
          className="w-full border p-2 rounded mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-64 overflow-y-auto">
          {filtered.map((u) => (
            <button
              key={u.userId}
              onClick={() => startChat(u.userId)}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded"
            >
              {u.photoURL ? (
                <img
                  src={u.photoURL}
                  className="w-10 h-10 rounded-full object-cover"
                  alt=""
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                  {(u.displayName || "U")[0]}
                </div>
              )}

              <span className="font-medium">
                {u.displayName || "Unnamed User"}
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              No users found
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full border py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
