"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createConversation } from "@/lib/conversations";

export default function StartChatPage() {
  const [otherUserId, setOtherUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleStartChat = async () => {
    if (!auth.currentUser || !otherUserId) return;
    
    try {
      setLoading(true);

      const conversationId = await createConversation(
        auth.currentUser.uid,
        otherUserId
      );

      router.push(`/chat?cid=${conversationId}`);
    } catch {
      alert("Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        Start New Chat
      </h1>

      <input
        type="text"
        placeholder="Enter other user ID"
        className="w-full border p-2 mb-4 rounded"
        value={otherUserId}
        onChange={(e) => setOtherUserId(e.target.value)}
      />

      <button
        onClick={handleStartChat}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded"
      >
        {loading ? "Starting..." : "Start Chat"}
      </button>
    </div>
  );
}
