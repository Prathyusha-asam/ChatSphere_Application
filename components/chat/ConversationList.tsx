"use client";

import { useState } from "react";
import { Conversation } from "@/types/conversation.types";

type Props = {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
};
export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.participants.join(" ").toLowerCase().includes(search.toLowerCase())
  );
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No conversations yet
      </div>
    );
  }
  return (
    <div className="w-80 border-r h-full flex flex-col">
      <input
        type="text"
        placeholder="Search conversations"
        className="m-3 p-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => {
          const isActive = conv.id === activeConversationId;

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-4 cursor-pointer border-b hover:bg-gray-100
                ${isActive ? "bg-purple-100" : ""}`}
            >
              <div className="font-medium text-gray-900">
                {conv.participants.join(", ")}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {conv.lastMessage}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(conv.lastMessageTime).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
