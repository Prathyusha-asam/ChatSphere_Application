/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { getUserProfile } from "@/lib/firestore";
import { useEffect, useState } from "react";

export default function HeaderTypingIndicator() {
  const { user } = useAuth();
  const { currentConversation } = useChat();

  const typingUserIds = useTypingIndicator(
    currentConversation?.id || "",
    user?.uid || ""
  );

  const [names, setNames] = useState<string[]>([]);

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

  if (!names.length) return null;

  return (
    <div className="px-6 pb-2 text-xs text-gray-500 select-none">
      {names.length === 1
        ? `${names[0]} is typing…`
        : `${names.join(", ")} are typing…`}
    </div>
  );
}
