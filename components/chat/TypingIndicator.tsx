"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useChat } from "@/hooks/useChat";
import { memo, useEffect, useState } from "react";
import { getUserProfile } from "@/lib/firestore";

/**
 * Displays typing indicator with user name(s)
 * Shows ONLY when OTHER user(s) are typing
 * Immediately hides when they stop
 */
function TypingIndicator() {
  const { user } = useAuth();
  const { currentConversation } = useChat();

  const conversationId = currentConversation?.id || "";

  const rawTypingUserIds = useTypingIndicator(
    conversationId,
    user?.uid || ""
  );

  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTypingUsers() {
      try {
        setError("");

        // 🚨 HARD RESET — nobody typing
        if (!rawTypingUserIds.length) {
          setTypingNames([]);
          return;
        }

        // ✅ DEFENSIVE FILTER — remove current user explicitly
        const otherUserIds = rawTypingUserIds.filter(
          (uid) => uid !== user?.uid
        );

        // 🚨 If only self was present → hide indicator
        if (!otherUserIds.length) {
          setTypingNames([]);
          return;
        }

        const names = await Promise.all(
          otherUserIds.map(async (uid) => {
            try {
              const profile = await getUserProfile(uid);
              return profile?.displayName || "Someone";
            } catch (err) {
              console.error("Failed to load typing user profile:", err);
              return "Someone";
            }
          })
        );

        if (active) {
          setTypingNames(names);
        }
      } catch (err) {
        console.error("TypingIndicator failed:", err);
        if (active) {
          setError("Unable to show typing status");
          setTypingNames([]);
        }
      }
    }

    loadTypingUsers();

    return () => {
      active = false;
    };
  }, [rawTypingUserIds, user?.uid]);

  // Guards
  if (!conversationId || !user) return null;

  if (error) {
    return (
      <div className="px-6 pb-2 text-xs text-red-500">
        {error}
      </div>
    );
  }

  if (!typingNames.length) return null;

  return (
    <div className="px-6 pb-2 text-xs text-gray-500 select-none">
      {typingNames.length === 1
        ? `${typingNames[0]} is typing…`
        : `${typingNames.join(", ")} are typing…`}
    </div>
  );
}

export default memo(TypingIndicator);
