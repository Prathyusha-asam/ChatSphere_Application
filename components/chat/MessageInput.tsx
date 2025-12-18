"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { setTypingStatus } from "@/lib/typing";
import { useChat } from "@/hooks/useChat";

export default function MessageInput() {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { currentConversation, sendMessage, loading } = useChat();

  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;
    if (text.trim()) {
      console.log("TYPING TRUE");
      setTypingStatus(currentConversation.id, auth.currentUser.uid, true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(
          currentConversation.id,
          auth.currentUser!.uid,
          false
        );
      }, 1000); 
    } else {
      setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, currentConversation]);

  const handleSend = async () => {
    if (!text.trim() || !currentConversation) return;

    await sendMessage(text);
    setText("");

    setTypingStatus(
      currentConversation.id,
      auth.currentUser!.uid,
      false
    );
  };

  if (!currentConversation) return null;

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 border p-2 rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-purple-600 text-white px-4 rounded"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
