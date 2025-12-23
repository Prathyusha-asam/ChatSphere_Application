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
import EmptyState from "@/components/ui/EmptyState";

//region ChatPageClient Component
/**
 * ChatPageClient
 *
 * Client-side chat page container.
 * - Reads conversation ID from URL query params
 * - Initializes active conversation in chat context
 * - Renders conversation list and chat panel
 * - Shows empty state when no conversation is selected
 *
 * @returns JSX.Element - Protected chat layout
 */
export default function ChatPageClient() {
    //region Hooks & State
  /**
   * Extracts conversation ID from URL query params (?cid=)
   */
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("cid");
  /**
   * Chat context actions & state
   * - startConversation: initializes or switches active conversation
   * - editMessage: used to re-key MessageInput during edit mode
   */
  const { startConversation, editMessage } = useChat();
  //endregion Hooks & State

  //region Side Effects
  /**
   * useEffect
   *
   * Purpose:
   * - Automatically starts a conversation when a conversation ID
   *   is present in the URL
   *
   * Behavior:
   * - Triggers on conversationId change
   * - Initializes conversation with empty participants (resolved later)
   */
  useEffect(() => {
    if (conversationId) {
      startConversation({
        id: conversationId,
        participants: [],
      });
    }
  }, [conversationId]);
 //endregion Side Effects

  //region Render
  /**
   * Renders the chat layout inside AuthGuard
   */
  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-72px)] bg-gray-50">
        {/* LEFT SIDEBAR */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <ConversationList />
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="flex flex-1 flex-col bg-white">
          {/* Empty State (ONLY CHANGE) */}
          {!conversationId && (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                title="Select a conversation"
                description="Choose a chat from the sidebar to start chatting."
                icon="/images/select-chat.svg"
              />
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
              <div className="border-t border-gray-200 px-4 py-3 bg-white">
                {/* KEY MOVED HERE */}
                <MessageInput key={editMessage?.id ?? "new-message"} />
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
  //endregion Render
}
//endregion ChatPageClient Component
