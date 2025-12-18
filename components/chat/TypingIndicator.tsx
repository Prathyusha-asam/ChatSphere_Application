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

  const [typingNames, setTypingNames] = useState<string[]>([]);

  if (!user || !currentConversation) return null;

  // userIds who are typing (excluding current user)
  const typingUserIds = useTypingIndicator(
    currentConversation.id,
    user.uid
  );

  useEffect(() => {
    let active = true;

    async function loadTypingUsers() {
      if (typingUserIds.length === 0) {
        setTypingNames([]);
        return;
      }

      const names = await Promise.all(
        typingUserIds.map(async (uid) => {
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

  if (typingNames.length === 0) return null;

  const text =
    typingNames.length === 1
      ? `${typingNames[0]} is typing...`
      : `${typingNames.join(", ")} are typing...`;

  return (
    <p className="text-sm text-gray-500 italic mt-2">
      {text}
    </p>
  );
}

export default memo(TypingIndicator);
