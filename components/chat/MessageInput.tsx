"use client";

import { useState, useRef, useEffect } from "react";
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
    replyTo,
    editMessage,
    clearComposerState,
  } = useChat();

  const [text, setText] = useState(editMessage?.text ?? "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [error, setError] = useState("");

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------- Emoji picker ref (ADDED) ---------- */
  const emojiRef = useRef<HTMLDivElement | null>(null);

  /* =========================================================
     Typing indicator (debounced & stable)
     ========================================================= */
  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;

    // Stop typing immediately if input is empty
    if (!text.trim()) {
      setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
      return;
    }

    // User is typing
    setTypingStatus(currentConversation.id, auth.currentUser.uid, true);

    // Clear previous debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(currentConversation.id, auth.currentUser!.uid, false);
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, currentConversation]);

  /* =========================================================
     Close emoji picker on outside click (ADDED)
     ========================================================= */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  /* =========================================================
     Send message
     ========================================================= */
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
      setShowEmoji(false); // 👈 CLOSE EMOJI PICKER AFTER SEND (ADDED)
      clearComposerState(); //
      // Stop typing immediately after send
      setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };

  /* =========================================================
     Cleanup on unmount (IMPORTANT)
     ========================================================= */
  useEffect(() => {
    return () => {
      if (auth.currentUser && currentConversation) {
        setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
      }
    };
  }, [currentConversation]);

  if (!currentConversation) return null;

  return (
    <div className="relative" key={editMessage?.id ?? "new-message"}>
      {(replyTo || editMessage) && (
        <div
          className="mb-2 flex items-center justify-between
                     rounded-lg bg-gray-100 px-3 py-2 text-xs"
        >
          <div className="truncate">
            {editMessage ? (
              <span className="font-medium text-gray-700">Editing message</span>
            ) : (
              <>
                <span className="font-medium text-gray-700">Replying to:</span>{" "}
                <span className="italic text-gray-600">{replyTo?.text}</span>
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
          <Image src="/images/smiley.svg" alt="Emoji" width={22} height={22} />
        </button>

        {showEmoji && (
          <div ref={emojiRef} className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker
              onEmojiClick={(e) => setText((prev) => prev + e.emoji)}
            />
          </div>
        )}

        <input
          type="text"
          placeholder={editMessage ? "Edit message…" : "Message"}
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          className={text.length > MAX_CHARS ? "text-red-500" : "text-gray-400"}
        >
          {text.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
