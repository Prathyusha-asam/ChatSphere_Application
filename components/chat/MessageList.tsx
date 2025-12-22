/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MessageSkeleton from "@/components/skeletons/MessageSkeleton";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import MessageItem from "./MessageItem";
import { getUserProfile } from "@/lib/firestore";

export default function MessageList() {
  const { messages, loading } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userCache = useRef<Record<string, string>>({});

  /* ---------- Auto scroll to bottom (unchanged behavior) ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sender names (cached)
  const getSenderName = async (uid: string) => {
    try {
      if (userCache.current[uid]) return userCache.current[uid];

      const profile = await getUserProfile(uid);
      const name = profile?.displayName || "Unknown";

      userCache.current[uid] = name;
      return name;
    } catch (err) {
      console.error("Failed to load sender name:", err);
      return "Unknown";
    }
  };



  /* ---------- Loading skeletons (unchanged) ---------- */
  if (loading) {
    return (
      <div className="px-6 py-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  /* ---------- Empty state (unchanged) ---------- */
  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">
          Start the conversation 👋
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
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

/* =========================================================
   Async message wrapper (logic unchanged, safely extended)
   ========================================================= */
function AsyncMessage({
  message,
  showSender,
  getSenderName,
}: any) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!message?.senderId) return;

    let mounted = true;

    getSenderName(message.senderId).then((n: string) => {
      if (mounted) setName(n);
    });


    return () => {
      mounted = false;
    };
  }, [message?.senderId, getSenderName]);

  return (
    <MessageItem
      id={message.id}
      text={message.text}
      senderId={message.senderId}
      senderName={name}
      createdAt={message.createdAt}
      editedAt={message.editedAt}
      replyTo={message.replyTo}
    />
  );
}
