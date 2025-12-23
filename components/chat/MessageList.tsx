/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import MessageSkeleton from "@/components/skeletons/MessageSkeleton";
import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import MessageItem from "./MessageItem";
import { getUserProfile } from "@/lib/firestore";
import EmptyState from "@/components/ui/EmptyState"; // ✅ added
import React from "react";
//region MessageList Component
/**
 * MessageList
 *
 * Renders the list of messages for the active conversation.
 * - Handles loading and empty states
 * - Auto-scrolls to the latest message
 * - Resolves sender names with caching
 *
 * @returns JSX.Element - Message list UI
 */
export default function MessageList() {
  //region Hooks & Refs
  /**
   * Chat state and refs
   */
  const { messages, loading } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userCache = useRef<Record<string, string>>({});
  const prevCountRef = useRef<number>(0);
  //endregion Hooks & Refs
  //region Auto Scroll
  /**
   * Automatically scrolls to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages]);
  //endregion Auto Scroll
  //region Sender Name Resolver
  /**
   * Resolves sender display name with caching
   *
   * @param uid - Sender user ID
   * @returns Promise<string> - Display name
   */
  const getSenderName = async (uid: string) => {
    if (userCache.current[uid]) return userCache.current[uid];
    const profile = await getUserProfile(uid);
    const name = profile?.displayName || "Unknown";
    userCache.current[uid] = name;
    return name;
  };
  //endregion Sender Name Resolver
  //region Loading State
  /**
   * Shows loading skeletons while messages load
   */
  if (loading) {
    return (
      <div className="px-6 py-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }
  //endregion Loading State
  //region Empty State
  /**
   * Shows empty state when no messages exist
   */
  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="No messages yet"
          description="Start the conversation"
          icon="/images/empty-state.svg"
        />
      </div>
    );
  }
  //endregion Empty State
  //region Render
  /**
   * Renders message list
   */
  return (
    <div className="px-6 py-4 space-y-4">
      {messages.map((msg) => (
        <MemoAsyncMessage
          key={msg.id}
          message={msg}
          getSenderName={getSenderName}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
  //endregion Render
}
//endregion MessageList Component
//region Async Message Wrapper
/**
 * MemoAsyncMessage
 *
 * Resolves sender name asynchronously and renders MessageItem.
 * Memoized to prevent unnecessary re-renders.
 */
const MemoAsyncMessage = React.memo(function AsyncMessage({
  message,
  getSenderName,
}: {
  message: any;
  getSenderName: (uid: string) => Promise<string>;
}) {
  //region Local State
  /**
   * Sender display name
   */
  const [name, setName] = useState("");
  //endregion Local State

  //region Effect
  /**
   * Fetches sender name when senderId changes
   */
  useEffect(() => {
    if (!message?.senderId) return;
    let mounted = true;
    getSenderName(message.senderId).then((n) => {
      if (mounted) setName(n);
    });
    return () => {
      mounted = false;
    };
  }, [message.senderId, getSenderName]);
  //endregion Effect
  //region Render
  /**
   * Renders MessageItem
   */
  return (
    <MessageItem
      id={message.id}
      text={message.text}
      senderId={message.senderId}
      senderName={name}
      createdAt={message.createdAt}
      editedAt={message.editedAt}
      replyTo={message.replyTo}
      isRead={message.isRead}
      deliveredAt={message.deliveredAt}
    />
  );
  //endregion Render
});
//endregion Async Message Wrapper
