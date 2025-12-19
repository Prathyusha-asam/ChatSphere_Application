"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import ConversationList from "@/components/chat/ConversationList";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import TypingIndicator from "@/components/chat/TypingIndicator";

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
      <div className="flex h-[calc(100vh-64px)]">

        {/* LEFT */}
        <ConversationList />

        {/* RIGHT */}
        <div className="flex flex-col flex-1">
          {!conversationId && (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}

          {conversationId && (
            <>
              <ChatHeader />

              <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                <MessageList />
              </div>

              <TypingIndicator />

              <div className="border-t p-3">
                <MessageInput />
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
