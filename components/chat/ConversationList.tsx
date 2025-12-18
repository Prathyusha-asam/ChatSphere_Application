"use client";

import { useState } from "react";
import { Conversation } from "@/types/conversation.types";

type Props = {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading?: boolean;
  error?: string | null;
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

  // 🔹 No conversations at all
  if (conversations.length === 0) {
    return (
      <div className="w-80 border-r h-full flex items-center justify-center text-gray-500">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="w-80 border-r h-full flex flex-col bg-white">

      {/* 🔹 Search Box */}
      <input
        type="text"
        placeholder="Search conversations"
        className="m-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 🔹 Conversation List */}
      <div className="flex-1 overflow-y-auto">

        {/* 🔹 Empty search result */}
        {filteredConversations.length === 0 && (
          <div className="p-4 text-gray-400 text-center">
            No conversations match your search
          </div>
        )}

        {filteredConversations.map((conv) => {
          const isActive = conv.id === activeConversationId;

          return (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              aria-selected={isActive}
              onClick={() => onSelectConversation(conv.id)}
              onKeyDown={(e) =>
                e.key === "Enter" && onSelectConversation(conv.id)
              }
              className={`p-4 cursor-pointer border-b transition
                hover:bg-gray-100
                ${isActive ? "bg-purple-100" : ""}`}
            >
              {/* Participant names */}
              <div className="font-medium text-gray-900 truncate">
                {conv.participants.join(", ")}
              </div>

              {/* Last message preview */}
              <div className="text-sm text-gray-600 truncate">
                {conv.lastMessage}
              </div>

              {/* Timestamp */}
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
