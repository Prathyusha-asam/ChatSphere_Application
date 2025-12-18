/* eslint-disable react-hooks/exhaustive-deps */
"use client";
 
import AuthGuard from "@/components/layout/AuthGuard";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageInput from "@/components/chat/MessageInput";
import MessageList from "@/components/chat/MessageList";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ConversationList from "@/components/chat/ConversationList";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import StartChat from "../start-chat/page";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("cid");
  const { startConversation } = useChat();
  const { conversations, loading, error } = useConversations();

  useEffect(() => {
    if (conversationId) {
      startConversation({
        id: conversationId,
        participants: [],
      });
    }
  }, [conversationId]);

  const handleSelectConversation = (id: string) => {
    router.push(`/chat?cid=${id}`);
  };

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-64px)]">
        <ConversationList
          conversations={conversations}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          loading={loading}
          error={error}
        />

        <div className="flex-1 flex flex-col">
          {!conversationId && (
            <div className="flex flex-1 items-center justify-center">
              <StartChat />
            </div>
          )}
          {conversationId && <ChatHeader />}

          {conversationId && (
            <>
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