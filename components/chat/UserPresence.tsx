"use client";

import { useUserPresence } from "@/hooks/useUserPresence";

export default function UserPresence() {
  const users = useUserPresence();

  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="font-semibold mb-2">Users</h3>

      {users
        // ✅ prevent rendering incomplete documents
        .filter((u) => u.id && u.displayName)
        .map((u) => (
          <div
            key={u.id} // ✅ Firestore document ID (guaranteed unique)
            className="flex items-center gap-2 mb-2"
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                u.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm">{u.displayName}</span>
          </div>
        ))}
    </div>
  );
}
