"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function loadUsers() {
      const snap = await getDocs(collection(db, "users"));
      const list: User[] = [];
      snap.forEach((doc) => {
        const data = doc.data() as User;
        if (data.userId && data.userId !== user?.uid) {
          list.push(data);
        }
      });
      setUsers(list);
    }
    loadUsers();
  }, [user]);

  const filtered = users.filter((u) =>
    (u.displayName || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const startChat = async (otherUserId: string) => {
    if (!user) return;
    const cid = await createConversation(user.uid, otherUserId);
    onClose();
    router.push(`/chat?cid=${cid}`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded-lg shadow-lg p-4">
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-64 overflow-y-auto">
          {filtered.map((u) => (
            <button
              key={`user-${u.userId}`}
              onClick={() => startChat(u.userId)}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded"
            >
              {u.photoURL ? (
                <img
                  src={u.photoURL}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  {(u.displayName || "U")[0]}
                </div>
              )}
              <span>{u.displayName || "Unnamed User"}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full border py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
