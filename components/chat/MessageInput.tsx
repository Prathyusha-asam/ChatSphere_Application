"use client";

import { useState, useRef, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { setTypingStatus } from "@/lib/typing";
import { useChat } from "@/hooks/useChat";
import EmojiPicker from "emoji-picker-react";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function MessageInput() {
  const {
    currentConversation,
    sendMessage,
    loading,
    replyTo,
    editMessage,
    clearComposerState,
  } = useChat();

  const [text, setText] = useState(editMessage?.text ?? "");
  const [showEmoji, setShowEmoji] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* =========================================================
     Typing indicator (FIXED with debounce)
     ========================================================= */
  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;

    // If text is empty → immediately stop typing
    if (!text.trim()) {
      setTypingStatus(
        currentConversation.id,
        auth.currentUser.uid,
        false
      );
      return;
    }

    // User is typing
    setTypingStatus(
      currentConversation.id,
      auth.currentUser.uid,
      true
    );

    // Clear previous timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // ⏱ Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(
        currentConversation.id,
        auth.currentUser!.uid,
        false
      );
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, currentConversation]);

  /* =========================================================
     Send message
     ========================================================= */
  const handleSend = async () => {
    if (!text.trim() || !currentConversation) return;

    await sendMessage(text);
    setText("");

    // Stop typing immediately after send
    setTypingStatus(
      currentConversation.id,
      auth.currentUser!.uid,
      false
    );
  };

  /* =========================================================
     Cleanup on unmount (IMPORTANT)
     ========================================================= */
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
    <div className="relative" key={editMessage?.id ?? "new-message"}>
      {(replyTo || editMessage) && (
        <div className="mb-2 flex items-center justify-between
                        rounded-lg bg-gray-100 px-3 py-2 text-xs">
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
          type="button"
          onClick={() => setShowEmoji((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-full
                     text-gray-600 hover:bg-gray-100 transition"
        >
          🙂
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
          placeholder={editMessage ? "Edit message…" : "Message"}
          value={text}
          onChange={(e) => setText(e.target.value)}
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
    </div>
  );
}
