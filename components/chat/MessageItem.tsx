"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { useChat } from "@/hooks/useChat";
import { deleteMessage } from "@/lib/messages";
import React from "react";

/* ---------- constants ---------- */
const MENU_WIDTH = 176;
const MENU_HEIGHT = 200;

interface MessageItemProps {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  createdAt?: {
    toDate: () => Date;
  };
  editedAt?: {
    toDate?: () => Date;
  };
  replyTo?: {
    id: string;
    text: string;
    senderId?: string;
  };
  isRead?: boolean;
  deliveredAt?: any;
}

function MessageItem({
  id,
  text,
  senderId,
  senderName,
  createdAt,
  editedAt,
  replyTo,
  isRead,
  deliveredAt,
}: MessageItemProps) {
  const isMine = senderId === auth.currentUser?.uid;

  const { currentConversation, setReplyTo, setEditMessage } = useChat();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  /* ---------- Right click ---------- */
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const clickX = e.clientX;
      const clickY = e.clientY;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let x = clickX;
      let y = clickY;

      if (clickX + MENU_WIDTH > vw) x = vw - MENU_WIDTH - 8;
      if (clickY + MENU_HEIGHT > vh) y = vh - MENU_HEIGHT - 8;

      setMenuPos({ x, y });
      setMenuOpen(true);
    },
    []
  );

  /* ---------- Close on outside click ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- Delete (MERGED + NT-29) ---------- */
  const handleDelete = useCallback(async () => {
    if (!id || !currentConversation) return;

    try {
      await deleteMessage(currentConversation.id, id);
    } catch (err) {
      setMenuOpen(false);
    }
  }, [id, currentConversation]);

  /* ---------- Reply ---------- */
  const handleReply = useCallback(() => {
    setReplyTo({ id, text, senderId });
    setMenuOpen(false);
  }, [id, text, senderId, setReplyTo]);

  /* ---------- Edit ---------- */
  const handleEdit = () => {
    setEditMessage({
      id,
      text,
    });
    setMenuOpen(false);
  }, [id, text, setEditMessage]);

  return (
    <>
      {/* Message bubble */}
      <div
        id={`message-${id}`}
        onContextMenu={handleContextMenu}
        className={`flex flex-col max-w-[75%] cursor-pointer
    ${isMine ? "ml-auto items-end" : "mr-auto items-start"}`}
      >
        {!isMine && senderName && (
          <span className="mb-1 text-xs text-gray-500">{senderName}</span>
        )}

        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed space-y-1
    ${isMine ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
        >
        
          {replyTo && !editedAt && (
            <div
              onClick={() => {
                const el = document.getElementById(`message-${replyTo.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });

                el?.classList.add("ring-2", "ring-gray-400");
                setTimeout(() => {
                  el?.classList.remove("ring-2", "ring-gray-400");
                }, 700);
              }}
              className={`flex gap-2 rounded-md px-2 py-1 text-xs cursor-pointer
      ${isMine ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-600"}`}
            >
              <div className="w-1 rounded bg-gray-400" />

              <div className="truncate">
                <div className="font-medium truncate">You</div>
                <div className="italic truncate">{replyTo.text}</div>
              </div>
            </div>
          )}

          {/*  Typed message MUST be BELOW quote */}
          <div className="whitespace-pre-wrap">{text}</div>

          {editedAt && (
            <span className="text-[10px] text-gray-400">(edited)</span>
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

      {/* Context Menu */}
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
}

/* ---------- Menu item ---------- */
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
        ${
          danger
            ? "text-red-600 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );
}
export default React.memo(MessageItem);
