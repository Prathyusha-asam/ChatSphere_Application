/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
//region UserPresence Component
/**
 * UserPresence
 *
 * Displays a list of users with real-time online/offline status.
 * - Uses presence hook for live updates
 * - Handles loading and empty states
 * - Defensively filters invalid user records
 *
 * @returns JSX.Element - User presence panel
 */
export default function UserPresence() {
  //region Hooks & State
  /**
   * Presence data and local UI state
   */
  const users = useUserPresence();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  //endregion Hooks & State
  //region Loading Tracker
  /**
   * Tracks loading state based on presence hook output
   * (presence hook handles errors internally)
   */
  useEffect(() => {
    if (Array.isArray(users)) {
      setLoading(false);
    }
  }, [users]);
  //endregion Loading Tracker
  //region Loading Guard
  /**
   * Displays loading placeholder
   */
  if (loading) {
    return (
      <div className="border rounded p-4 mb-4 text-sm text-gray-500">
        Loading users…
      </div>
    );
  }
  //endregion Loading Guard
  //region Error Guard
  /**
   * Displays error state (defensive)
   */
  if (error) {
    return (
      <div className="border rounded p-4 mb-4 text-sm text-red-600">
        {error}
      </div>
    );
  }
  //endregion Error Guard
  //region Defensive Filter
  /**
   * Filters out invalid or incomplete user records
   */
  const safeUsers = users.filter(
    (u) => u?.id && u?.displayName
  );
  //endregion Defensive Filter
  //region Empty State
  /**
   * Displays empty state when no users are present
   */
  if (!safeUsers.length) {
    return (
      <div className="border rounded p-4 mb-4">
        <EmptyState
          title="No active users"
          description="Users will appear here when they come online."
          icon="/images/users-empty.svg"
        />
      </div>
    );
  }
  //endregion Empty State
  //region Render
  /**
   * Renders user presence list
   */
  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="font-semibold mb-2">Users</h3>
      {safeUsers.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-2 mb-2"
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${u.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
          />
          <span className="text-sm">{u.displayName}</span>
        </div>
      ))}
    </div>
  );
  //endregion Render
}
//endregion UserPresence Component