"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import MessageInput from "@/components/chat/MessageInput";
import MessageList from "@/components/chat/MessageList";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import StartChat from "../start-chat/page";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("cid");
  const { startConversation } = useChat();

  useEffect(() => {
    if (conversationId) {
      startConversation({
        id: conversationId,
        participants: [],
      });
    }
  }, [conversationId]);

  return (
    <AuthGuard>
      <div className="flex flex-col h-[calc(100vh-64px)] p-4">
        <h1 className="text-xl font-semibold mb-2">Chat</h1>

        {/* 👇 NO CONVERSATION */}
        {!conversationId && (
          <div className="flex flex-1 items-center justify-center">
            <StartChat />
          </div>
        )}

        {conversationId && (
          <>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              <MessageList />
            </div>

            <TypingIndicator />

            <div className="border-t pt-3">
              <MessageInput />
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
