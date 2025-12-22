"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useChat } from "@/hooks/useChat";
import { memo, useEffect, useState } from "react";
import { getUserProfile } from "@/lib/firestore";

/**
 * Displays typing indicator with user name(s)
 */
function TypingIndicator() {
  const { user } = useAuth();
  const { currentConversation } = useChat();

  const conversationId = currentConversation?.id || "";

  const typingUserIds = useTypingIndicator(
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

        if (!typingUserIds.length) {
          setTypingNames([]);
          return;
        }

        const names = await Promise.all(
          typingUserIds.map(async (uid: string) => {
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
  }, [typingUserIds]);

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
