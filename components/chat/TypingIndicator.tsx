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

  useEffect(() => {
    let active = true;

    async function loadTypingUsers() {
      if (!typingUserIds.length) {
        setTypingNames([]);
        return;
      }

      const names = await Promise.all(
        typingUserIds.map(async (uid: string) => {
          const profile = await getUserProfile(uid);
          return profile?.displayName || "Unknown";
        })
      );

      if (active) {
        setTypingNames(names);
      }
    }

    loadTypingUsers();

    return () => {
      active = false;
    };
  }, [typingUserIds]);

  // ✅ Correct guards
  if (!conversationId || !user || typingNames.length === 0) {
    return null;
  }

  return (
    <div className="px-6 pb-2 text-xs text-gray-500 select-none">
      {typingNames.length === 1
        ? `${typingNames[0]} is typing…`
        : `${typingNames.join(", ")} are typing…`}
    </div>
  );
}

export default memo(TypingIndicator);
