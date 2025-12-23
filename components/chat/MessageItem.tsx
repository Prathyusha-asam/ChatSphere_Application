/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { useChat } from "@/hooks/useChat";
import { deleteMessage } from "@/lib/messages";
import React from "react";
import Image from "next/image";
import { MessageItemProps } from "@/types/firestore";
/**
 * MessageItem
 *
 * Renders a single chat message.
 * - Supports reply, edit, and delete actions
 * - Displays delivery/read status
 * - Supports image messages
 * - Shows contextual menu on right-click
 *
 * @param props - Message item properties
 * @returns JSX.Element - Message bubble UI
 */
function MessageItem({
  id,
  text,
  senderId,
  senderName,
  createdAt,
  editedAt,
  replyTo,
  imageUrl,
  isRead,
  deliveredAt,
}: MessageItemProps) {
  //region Derived State
  /**
   * Determines whether message belongs to current user
   */
  const isMine = senderId === auth.currentUser?.uid;
  //endregion Derived State
  //region Chat Context
  /**
   * Chat actions for reply and edit
   */
  const {
    currentConversation,
    setReplyTo,
    setEditMessage,
  } = useChat();
  //endregion Chat Context
  //region Local State & Refs
  /**
   * Context menu state and positioning
   */
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  //endregion Local State & Refs
  //region Outside Click Handler
  /**
   * Closes context menu when clicking outside
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  //endregion Outside Click Handler
  //region Actions
  /**
   * Deletes the message
   */
  const handleDelete = useCallback(async () => {
    if (!id || !currentConversation) return;
    try {
      await deleteMessage(currentConversation.id, id);
    } catch {
      setMenuOpen(false);
    }
  }, [id, currentConversation]);
  /**
    * Sets reply state for the message
    */
  const handleReply = useCallback(() => {
    setReplyTo({ id, text, senderId });
    setMenuOpen(false);
  }, [id, text, senderId, setReplyTo]);
  /**
   * Enables edit mode for the message
   */
  const handleEdit = useCallback(() => {
    setEditMessage({ id, text });
    setMenuOpen(false);
  }, [id, text, setEditMessage]);
  //endregion Actions
  const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  setMenuPos({
    x: e.clientX,
    y: e.clientY,
  });
  setMenuOpen(true);
};
  //region Render
  /**
   * Renders message bubble and context menu
   */
  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className={`flex flex-col max-w-[75%] cursor-pointer
          ${isMine ? "ml-auto items-end" : "mr-auto items-start"}`}
      >
        {!isMine && senderName && (
          <span className="mb-1 text-xs text-gray-500">
            {senderName}
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed
            ${isMine ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Sent image"
              className="mb-2 max-w-[240px] rounded-lg"
              width={16}
              height={16}
            />
          )}
          {/* Reply preview */}
          {replyTo && (
            <div className="mb-1 rounded-lg bg-gray-200 px-2 py-1 text-xs text-gray-700">
              Replying to:{" "}
              <span className="italic">{replyTo.text}</span>
            </div>
          )}
          {text}
          {editedAt && (
            <span className="ml-1 text-[10px] text-gray-400">
              (edited)
            </span>
          )}
        </div>
        {createdAt && (
          <span className="mt-1 text-[10px] text-gray-400">
            {createdAt.toDate().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isMine && (
              <span className="ml-1">
                {isRead
                  ? "👁 Seen"
                  : deliveredAt
                    ? "✓ Delivered"
                    : "Sending…"}
              </span>
            )}
          </span>
        )}
      </div>
      {menuOpen && (
        <div
          ref={menuRef}
          style={{ top: menuPos.y, left: menuPos.x }}
          className="fixed z-50 w-44 rounded-lg border border-gray-200
                     bg-white shadow-lg py-1 text-sm"
        >
          <MenuItem label="Reply" onClick={handleReply} />
          {isMine && <MenuItem label="Edit" onClick={handleEdit} />}
          {isMine && (
            <>
              <div className="my-1 h-px bg-gray-200" />
              <MenuItem label="Delete" danger onClick={handleDelete} />
            </>
          )}
        </div>
      )}
    </>
  );
  //endregion Render
}
//endregion MessageItem Component
//region MenuItem Component
/**
 * MenuItem
 *
 * Reusable context menu item
 */
function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left transition
        ${danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );
}
//endregion MenuItem Component
export default React.memo(MessageItem);