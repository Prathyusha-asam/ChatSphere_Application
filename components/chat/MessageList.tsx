/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MessageSkeleton from "@/components/skeletons/MessageSkeleton";
import { useEffect, useRef, useState, useCallback } from "react"; // NT-29: added useCallback
import { useChat } from "@/hooks/useChat";
import MessageItem from "./MessageItem";
import { getUserProfile } from "@/lib/firestore";
import React from "react";

export default function MessageList() {
  const { messages, loading } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userCache = useRef<Record<string, string>>({});
  const prevCountRef = useRef<number>(0); // NT-29: track message count

  /* ---------- Auto scroll to bottom (behavior preserved, optimized) ---------- */
  useEffect(() => {
    // NT-29: scroll only when a new message arrives
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  // Load sender names (cached)
  const getSenderName = useCallback(async (uid: string) => {
    // NT-29: memoized to avoid recreation
    if (userCache.current[uid]) return userCache.current[uid];

    const profile = await getUserProfile(uid);
    const name = profile?.displayName || "Unknown";

    userCache.current[uid] = name;
    return name;
  }, []);

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
        <MemoAsyncMessage
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
   Async message wrapper (logic unchanged, NT-29 optimized)
   ========================================================= */
const MemoAsyncMessage = React.memo(function AsyncMessage({
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
});
