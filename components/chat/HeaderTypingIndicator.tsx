/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { getUserProfile } from "@/lib/firestore";
import { useEffect, useState } from "react";
//region HeaderTypingIndicator Component
/**
 * HeaderTypingIndicator
 *
 * Displays typing status for users in the active conversation.
 * - Subscribes to typing indicator updates
 * - Resolves user display names
 * - Handles single and multiple typing users
 *
 * @returns JSX.Element | null - Typing indicator text or nothing
 */
export default function HeaderTypingIndicator() {
  //region Hooks & State
  /**
   * Authentication and chat context
   */
  const { user } = useAuth();
  const { currentConversation } = useChat();
  /**
    * Typing indicator hook
    * - Returns array of user IDs currently typing
    */
  const typingUserIds = useTypingIndicator(
    currentConversation?.id || "",
    user?.uid || ""
  );
  /**
    * Local state
    * - names: resolved display names of typing users
    */
  const [names, setNames] = useState<string[]>([]);
  //endregion Hooks & State
  //region Resolve Typing User Names
  /**
   * Resolves display names for typing user IDs.
   * - Clears names when no one is typing
   * - Fetches user profiles in parallel
   */
  useEffect(() => {
    if (!typingUserIds.length) {
      setNames([]);
      return;
    }
    const loadNames = async () => {
      try {
        const resolved = await Promise.all(
          typingUserIds.map(async (uid) => {
            const profile = await getUserProfile(uid);
            return profile?.displayName || "Someone";
          })
        );
        setNames(resolved);
      } catch (err) {
        console.error("Typing indicator error:", err);
        setNames([]);
      }
    };
    loadNames();
  }, [typingUserIds]);
  //endregion Resolve Typing User Names
  //region Guard
  /**
   * Hide indicator when no users are typing
   */
  if (!names.length) return null;
  //endregion Guard
  //region Render
  /**
   * Renders typing indicator text
   */
  return (
    <div className="px-6 pb-2 text-xs text-gray-500 select-none">
      {names.length === 1
        ? `${names[0]} is typing…`
        : `${names.join(", ")} are typing…`}
    </div>
  );
  //endregion Render
}
//endregion HeaderTypingIndicator Component