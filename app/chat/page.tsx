/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
      <div className="flex h-[calc(100vh-72px)] bg-gray-50">

        {/* LEFT SIDEBAR */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <ConversationList />
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="flex flex-1 flex-col bg-white">

          {/* Empty State */}
          {!conversationId && (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
              Select a conversation to start chatting
            </div>
          )}

          {/* Active Conversation */}
          {conversationId && (
            <>
              {/* Header */}
              <div className="border-b border-gray-200">
                <ChatHeader />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
                <MessageList />
              </div>

              {/* Typing */}
              <div className="px-6">
                <TypingIndicator />
              </div>

              {/* Input */}
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
