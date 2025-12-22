"use client";

import { useState, useRef, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { setTypingStatus } from "@/lib/typing";
import { useChat } from "@/hooks/useChat";
import EmojiPicker from "emoji-picker-react";
import LoadingSpinner from "../ui/LoadingSpinner";

const MAX_CHARS = 500; // ✅ added

export default function MessageInput() {
  const {
    currentConversation,
    sendMessage,
    loading,
    replyTo,
    editMessage,
    clearComposerState,
  } = useChat();

  const [error, setError] = useState(""); // ✅ added

  /* ✅ Initialize state ONCE per edit session */
  const [text, setText] = useState(editMessage?.text ?? "");
  const [showEmoji, setShowEmoji] = useState(false);

  const emojiRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* Typing indicator (valid effect) */
  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;

    setTypingStatus(
      currentConversation.id,
      auth.currentUser.uid,
      !!text
    );
  }, [text, currentConversation]);

  const handleSend = async () => {
    if (!currentConversation) return;

    const trimmedText = text.trim();

    // ✅ Message validation
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

      setTypingStatus(
        currentConversation.id,
        auth.currentUser!.uid,
        false
      );
    } catch {
      // ✅ Error handling
      setError("Failed to send message. Please try again.");
    }
  };

  if (!currentConversation) return null;

  return (
    <div
      className="relative"
      /* 🔑 THIS IS THE MAGIC */
      key={editMessage?.id ?? "new-message"}
    >
      {(replyTo || editMessage) && (
        <div
          className="mb-2 flex items-center justify-between
                     rounded-lg bg-gray-100 px-3 py-2 text-xs"
        >
          <div className="truncate">
            {editMessage ? (
              <span className="font-medium text-gray-700">
                Editing message
              </span>
            ) : (
              <>
                <span className="font-medium text-gray-700">
                  Replying to:
                </span>{" "}
                <span className="italic text-gray-600">
                  {replyTo?.text}
                </span>
              </>
            )}
          </div>

          <button
            onClick={clearComposerState}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowEmoji((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-full
                     text-gray-600 hover:bg-gray-100 transition"
        >
          🙂
        </button>

        {showEmoji && (
          <div
            ref={emojiRef}
            className="absolute bottom-full left-0 mb-2 z-50"
          >
            <EmojiPicker
              onEmojiClick={(e) =>
                setText((prev) => prev + e.emoji)
              }
            />
          </div>
        )}

        <input
          type="text"
          placeholder={editMessage ? "Edit message…" : "Message"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // ✅ Ctrl + Enter support
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

      {/* ✅ Error message + character count */}
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
