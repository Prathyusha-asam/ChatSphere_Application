"use client";

import { useState } from "react";
import { sendMessage } from "@/lib/messages";
import { auth } from "@/lib/firebase";

interface Props {
  conversationId: string;
}

export default function MessageInput({ conversationId }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      await sendMessage(
        conversationId,
        auth.currentUser.uid,
        text
      );
      setText("");
    } catch {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
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
