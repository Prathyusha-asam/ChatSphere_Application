"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { setTypingStatus } from "@/lib/typing";
import { useChat } from "@/hooks/useChat";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

const MAX_CHARS = 500;

export default function MessageInput() {
  const { currentConversation, sendMessage, loading } = useChat();

  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------
     Typing Indicator Logic (existing)
  ------------------------------------ */
  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;

    if (text.trim()) {
      setTypingStatus(currentConversation.id, auth.currentUser.uid, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(
          currentConversation.id,
          auth.currentUser!.uid,
          false
        );
      }, 3000);
    } else {
      setTypingStatus(
        currentConversation.id,
        auth.currentUser.uid,
        false
      );
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, currentConversation]);

  /* ------------------------------------
     Send Message
  ------------------------------------ */
  const handleSend = async () => {
    if (!text.trim()) return;
    if (!currentConversation) return;

    try {
      setError(null);
      await sendMessage(text.trim());
      setText("");
      setShowEmoji(false);

      setTypingStatus(
        currentConversation.id,
        auth.currentUser!.uid,
        false
      );
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
  };

  /* ------------------------------------
     Ctrl + Enter Support
  ------------------------------------ */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ------------------------------------
     Emoji Click
  ------------------------------------ */
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  if (!currentConversation) return null;

  return (
    <div className="border-t p-3">
      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-1">{error}</p>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-16">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="px-2 text-xl"
        >
          😊
        </button>

        {/* Input */}
        <input
          type="text"
          placeholder="Type a message (Ctrl + Enter to send)"
          className="flex-1 border rounded px-3 py-2 focus:outline-none"
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Character Count */}
      <div className="text-right text-xs text-gray-500 mt-1">
        {text.length}/{MAX_CHARS}
      </div>
    </div>
  );
}
