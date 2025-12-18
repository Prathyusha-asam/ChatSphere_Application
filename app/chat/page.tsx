"use client";
 
import AuthGuard from "@/components/layout/AuthGuard";
import { useRouter, useSearchParams } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { useFirestore } from "@/hooks/useFirestore";
import ConversationList from "@/components/chat/ConversationList";
import MessageInput from "@/components/chat/MessageInput";
 
export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
 
  const conversationId = searchParams.get("cid");
 
  // 🔹 Conversations (LEFT panel)
  const {
    conversations,
    loading: convoLoading,
    error: convoError,
  } = useConversations();
 
  // 🔹 Messages (RIGHT panel)
  const {
    messages,
    loading: msgLoading,
    error: msgError,
  } = useFirestore(conversationId ?? "");
 
  const handleSelectConversation = (id: string) => {
    router.push(`/chat?cid=${id}`);
  };
 
  return (
<AuthGuard>
<div className="flex h-screen">
 
        {/* 🔹 LEFT: Conversation List */}
<ConversationList
          conversations={conversations}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          loading={convoLoading}
          error={convoError}
        />
 
        {/* 🔹 RIGHT: Chat Panel */}
<div className="flex-1 flex flex-col p-6">
 
          <h1 className="text-xl font-semibold mb-4">Chat</h1>
 
          {!conversationId && (
<div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
</div>
          )}
 
          {msgLoading && <p>Loading messages...</p>}
          {msgError && <p className="text-red-500">{msgError}</p>}
 
          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.map((msg) => (
<div key={msg.id}>{msg.text}</div>
            ))}
</div>
 
          {conversationId && (
<MessageInput conversationId={conversationId} />
          )}
</div>
</div>
</AuthGuard>
  );
}