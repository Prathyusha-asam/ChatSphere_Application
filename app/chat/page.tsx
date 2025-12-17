"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useSearchParams } from "next/navigation";
import { useFirestore } from "@/hooks/useFirestore";
import MessageInput from "@/components/chat/MessageInput";


export default function ChatPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("cid") || "";

  const { messages, loading, error } = useFirestore(conversationId);

  return (
    <AuthGuard>
      <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Chat</h1>

      {!conversationId && (
        <div className="mt-4">
          <p className="text-gray-500 mb-3">
            No conversation yet
          </p>

          <a
            href="/start-chat"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded"
          >
            Start Chat
          </a>
        </div>
      )}

      {loading && <p>Loading messages...</p>}
      {error && <p>{error}</p>}

      {messages.map((msg) => (
        <div key={msg.id}>{msg.text}</div>
      ))}

      {conversationId && (
        <MessageInput conversationId={conversationId} />
      )}
    </div>
    </AuthGuard>
  );
}
