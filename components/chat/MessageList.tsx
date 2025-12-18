"use client";

import { useChat } from "@/hooks/useChat";
import { auth } from "@/lib/firebase";
import { useEffect, useRef } from "react";

export default function MessageList() {
  const { messages, loading } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-3 p-2">
      {loading && <p className="text-gray-400">Loading messages...</p>}
      {!loading && messages.length === 0 && (
        <p className="text-gray-400">No messages yet</p>
      )}

      {messages.map((msg) => {
        const isMine = msg.senderId === auth.currentUser?.uid;

        return (
          <div
            key={msg.id}
            className={`max-w-xs p-2 rounded ${
              isMine
                ? "bg-purple-600 text-white ml-auto"
                : "bg-gray-200 text-black mr-auto"
            }`}
          >
            {msg.text}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
