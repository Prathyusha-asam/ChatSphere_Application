/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import MessageItem from "./MessageItem";
import { getUserProfile } from "@/lib/firestore";

export default function MessageList() {
  const { messages, loading } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userCache = useRef<Record<string, string>>({});

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sender names (cached)
  const getSenderName = async (uid: string) => {
    if (userCache.current[uid]) return userCache.current[uid];

    const profile = await getUserProfile(uid);
    const name = profile?.displayName || "Unknown";
    userCache.current[uid] = name;
    return name;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-2/3 bg-gray-200 rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!loading && messages.length === 0) {
    return (
      <p className="text-gray-400 text-center mt-10">
        No messages yet. Start the conversation 👋
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, index) => {
        const prev = messages[index - 1];
        const showSender =
          !prev || prev.senderId !== msg.senderId;

        return (
          <AsyncMessage
            key={msg.id}
            message={msg}
            showSender={showSender}
            getSenderName={getSenderName}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

function AsyncMessage({
  message,
  showSender,
  getSenderName,
}: any) {
  const [name, setName] = useState("");

  useEffect(() => {
    getSenderName(message.senderId).then(setName);
  }, [message.senderId]);

  return (
    <MessageItem
      text={message.text}
      senderId={message.senderId}
      senderName={name}
      createdAt={message.createdAt}
      showSender={showSender}
    />
  );
}
