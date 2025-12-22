"use client";

import { useUserPresence } from "@/hooks/useUserPresence";
import { useState, useEffect } from "react";

export default function UserPresence() {
  const users = useUserPresence();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      if (Array.isArray(users)) {
        setLoading(false);
      }
    } catch (err) {
      console.error("User presence failed:", err);
      setError("Unable to load user presence");
      setLoading(false);
    }
  }, [users]);

  if (loading) {
    return (
      <div className="border rounded p-4 mb-4 text-sm text-gray-500">
        Loading users…
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded p-4 mb-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const safeUsers = users.filter(
    (u) => u.id && u.displayName
  );

  if (!safeUsers.length) {
    return (
      <div className="border rounded p-4 mb-4 text-sm text-gray-500">
        No active users
      </div>
    );
  }

  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="font-semibold mb-2">Users</h3>

      {safeUsers.map((u) => (
        <div
          key={u.id}
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
