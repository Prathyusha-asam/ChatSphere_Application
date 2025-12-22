"use client";

import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { auth } from "@/lib/firebase";
import { setTypingStatus } from "@/lib/typing";
import { useChat } from "@/hooks/useChat";
import EmojiPicker from "emoji-picker-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import Image from "next/image";

const MAX_CHARS = 500;

export default function MessageInput() {
  const {
    currentConversation,
    sendMessage,
    loading,
    editMessage,
    replyTo,
    clearComposerState,
  } = useChat();

  /* ---------------------------------------------------------
     State (initialized once per edit via remount key)
  --------------------------------------------------------- */
  const [text, setText] = useState(editMessage?.text ?? "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------
     Typing indicator (combined logic)
  --------------------------------------------------------- */
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (!auth.currentUser || !currentConversation) return;

    const typingNow = value.trim().length > 0;

    // Immediate typing state update
    if (isTypingRef.current !== typingNow) {
      isTypingRef.current = typingNow;
      setTypingStatus(
        currentConversation.id,
        auth.currentUser.uid,
        typingNow
      );
    }
  };

  /* ---------------------------------------------------------
     Debounced typing stop (2s inactivity)
  --------------------------------------------------------- */
  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;

    if (!text.trim()) {
      setTypingStatus(
        currentConversation.id,
        auth.currentUser.uid,
        false
      );
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(
        currentConversation.id,
        auth.currentUser!.uid,
        false
      );
      isTypingRef.current = false;
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, currentConversation]);

  /* ---------------------------------------------------------
     Send message
  --------------------------------------------------------- */
  const handleSend = async () => {
    if (!currentConversation || !auth.currentUser) return;

    const trimmedText = text.trim();

    if (!trimmedText) {
      setError("Message cannot be empty");
      return;
    }

    if (trimmedText.length > MAX_CHARS) {
      setError(`Message cannot exceed ${MAX_CHARS} characters`);
      return;
    }

    try {
      setError("");
      await sendMessage(trimmedText);

      setText("");
      clearComposerState?.();

      // Stop typing immediately after send
      isTypingRef.current = false;
      setTypingStatus(
        currentConversation.id,
        auth.currentUser.uid,
        false
      );
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };

  /* ---------------------------------------------------------
     Cleanup on unmount (IMPORTANT)
  --------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (auth.currentUser && currentConversation) {
        setTypingStatus(
          currentConversation.id,
          auth.currentUser.uid,
          false
        );
      }
    };
  }, [currentConversation]);

  if (!currentConversation) return null;

  return (
    <div
      className="relative"
      key={editMessage?.id ?? "new-message"} // 🔑 critical for edit remount
    >
      {/* EDIT / REPLY INDICATOR */}
      {(editMessage || replyTo) && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs">
          <div className="truncate">
            <span className="font-medium text-gray-700">
              {editMessage ? "Editing message" : "Replying to"}
            </span>
            {!editMessage && (
              <div className="italic text-gray-600 truncate">
                {replyTo?.text}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setText("");
              clearComposerState();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* INPUT ROW */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmoji((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-full
                     text-gray-600 hover:bg-gray-100 transition"
        >
          <Image
            src="/images/smiley.svg"
            alt="Emoji"
            width={22}
            height={22}
          />
        </button>

        {showEmoji && (
          <div className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker
              onEmojiClick={(e) =>
                setText((prev) => prev + e.emoji)
              }
            />
          </div>
        )}

        <input
          type="text"
          value={text}
          placeholder={editMessage ? "Edit message…" : "Message"}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-full border border-gray-300 bg-white
                     px-4 py-2 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="flex h-10 min-w-[64px] items-center justify-center
                     rounded-full bg-black px-4 text-sm font-medium text-white
                     hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? <LoadingSpinner size={16} /> : "Send"}
        </button>
      </div>

      {/* Error + character count */}
      <div className="mt-1 flex items-center justify-between px-2 text-xs">
        <span className="text-red-500">{error}</span>
        <span
          className={
            text.length > MAX_CHARS
              ? "text-red-500"
              : "text-gray-400"
          }
        >
          {text.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
