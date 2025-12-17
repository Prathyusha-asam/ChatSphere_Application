"use client";

import { useState } from "react";
import ConversationList from "@/components/chat/ConversationList";
import { Conversation } from "@/types/conversation.types";

const mockConversations: Conversation[] = [
  {
    id: "1",
    participants: ["Alice"],
    lastMessage: "Hey, how are you?",
    lastMessageTime: new Date().toISOString(),
  },
  {
    id: "2",
    participants: ["Bob"],
    lastMessage: "Let’s meet tomorrow",
    lastMessageTime: new Date().toISOString(),
  },
];

export default function ChatPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      <ConversationList
        conversations={mockConversations}
        activeConversationId={activeId}
        onSelectConversation={setActiveId}
      />

      <div className="flex-1 flex items-center justify-center">
        {activeId
          ? `Conversation ${activeId}`
          : "Select a conversation"}
      </div>
    </div>
  );
}
