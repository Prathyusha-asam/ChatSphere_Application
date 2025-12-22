"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";

import ConversationList from "@/components/chat/ConversationList";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageInput from "@/components/chat/MessageInput";
import MessageList from "@/components/chat/MessageList";
import TypingIndicator from "@/components/chat/TypingIndicator";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("cid");
  const { startConversation } = useChat();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const initConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError("");

      await startConversation({
        id: conversationId,
        participants: [],
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError("Unable to open conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initConversation();
  }, [conversationId]);

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-72px)] bg-gray-50">

        {/* LEFT SIDEBAR */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <ConversationList />
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="flex flex-1 flex-col bg-white">

          {/* Loading */}
          {loading && (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              Loading conversation…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={initConversation}
                className="mt-2 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!conversationId && !loading && !error && (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
              Select a conversation to start chatting
            </div>
          )}

          {/* Active Conversation */}
          {conversationId && !loading && !error && (
            <>
              <div className="border-b border-gray-200">
                <ChatHeader />
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
                <MessageList />
              </div>

              <div className="px-6">
                <TypingIndicator />
              </div>

              <div className="border-t border-gray-200 px-4 py-3 bg-white">
                <MessageInput />
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
