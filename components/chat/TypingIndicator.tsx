/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, memo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { getUserProfile } from "@/lib/firestore";

function TypingIndicator() {
  const { user } = useAuth();
  const { currentConversation } = useChat();

  const conversationId = currentConversation?.id;

  const typingUserIds = useTypingIndicator(
    conversationId,
    user?.uid
  );

  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    if (!typingUserIds.length) {
      setNames([]);
      return;
    }

    let active = true;

    Promise.all(
      typingUserIds.map(async (uid) => {
        const profile = await getUserProfile(uid);
        return profile?.displayName || "Someone";
      })
    ).then((resolved) => {
      if (active) setNames(resolved);
    });

    return () => {
      active = false;
    };
  }, [typingUserIds]);

  if (
    !conversationId ||
    !user ||
    names.length === 0
  ) {
    return null;
  }

  return (
    <p className="text-sm text-gray-500 italic px-4 pb-2">
      {names.length === 1
        ? `${names[0]} is typing...`
        : `${names.join(", ")} are typing...`}
    </p>
  );
}

export default memo(TypingIndicator);
