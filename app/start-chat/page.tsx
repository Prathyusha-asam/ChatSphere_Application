"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createConversation } from "@/lib/conversations";

export default function StartChat() {
  const [otherUserId, setOtherUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    if (!auth.currentUser || !otherUserId.trim()) return;

    try {
      setLoading(true);

      const conversationId = await createConversation(
        auth.currentUser.uid,
        otherUserId.trim()
      );

      router.push(`/chat?cid=${conversationId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to start conversation");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white px-5 py-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Start a new chat
      </h2>

      <input
        type="text"
        placeholder="Enter user ID"
        className="w-full rounded-lg border border-gray-300 bg-white
                   px-3 py-2 mb-4 text-sm text-gray-900
                   placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        value={otherUserId}
        onChange={(e) => setOtherUserId(e.target.value)}
      />

      <button
        onClick={handleStartChat}
        disabled={loading}
        className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white
                   hover:bg-gray-800 transition disabled:opacity-60"
      >
        {loading ? "Starting..." : "Start chat"}
      </button>
    </div>
  );
}
