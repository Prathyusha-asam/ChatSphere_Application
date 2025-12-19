/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import MessageItem from "./MessageItem";
import { getUserProfile } from "@/lib/firestore";

export default function MessageList() {
  const { messages, loading } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const nameCache = useRef<Record<string, string>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSenderName = async (uid: string) => {
    if (nameCache.current[uid]) return nameCache.current[uid];
    const profile = await getUserProfile(uid);
    const name = profile?.displayName || "Unknown";
    nameCache.current[uid] = name;
    return name;
  };

  if (loading) {
    return <p className="text-gray-400">Loading messages...</p>;
  }

  if (!messages.length) {
    return (
      <p className="text-gray-400 text-center mt-10">
        Say Hello 👋
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <AsyncMessage
          key={msg.id}
          message={msg}
          getSenderName={getSenderName}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function AsyncMessage({
  message,
  getSenderName,
}: {
  message: any;
  getSenderName: (uid: string) => Promise<string>;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (message?.senderId) {
      getSenderName(message.senderId).then(setName);
    }
  }, [message?.senderId]);

  return (
    <MessageItem
      id={message.id}
      text={message.text}
      senderId={message.senderId}
      senderName={name}
      createdAt={message.createdAt}
    />
  );
}
