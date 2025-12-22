"use client";

import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
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
    editMessage,
    replyTo, //  ADDED (required for reply UI)
    clearComposerState,
  } = useChat();

  /* 
     State initialized ONCE per edit via remount */
  const [text, setText] = useState(editMessage?.text ?? "");
  const [showEmoji, setShowEmoji] = useState(false);

  const isTypingRef = useRef(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (!auth.currentUser || !currentConversation) return;

    const typingNow = value.length > 0;
    if (isTypingRef.current !== typingNow) {
      isTypingRef.current = typingNow;
      setTypingStatus(currentConversation.id, auth.currentUser.uid, typingNow);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !currentConversation) return;

    await sendMessage(text);

    setText("");
    clearComposerState();

    if (auth.currentUser) {
      isTypingRef.current = false;
      setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
    }
  };

  if (!currentConversation) return null;

  return (
    <div
      className="relative"
      /*  THIS IS THE KEY FIX FOR EDIT */
      key={editMessage?.id ?? "new-message"}
    >
      {/*  EDIT INDICATOR */}
      {editMessage && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs">
          <span className="font-medium text-gray-700">Editing message</span>
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

      {/*  REPLY PREVIEW (WhatsApp-style) */}
      {replyTo && !editMessage && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs">
          <div className="truncate">
            <span className="font-medium text-gray-700">Replying to</span>
            <div className="italic text-gray-600 truncate">{replyTo.text}</div>
          </div>

          <button
            onClick={() => clearComposerState()}
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
          🙂
        </button>

        {showEmoji && (
          <div className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker
              onEmojiClick={(e) => setText((prev) => prev + e.emoji)}
            />
          </div>
        )}

        <input
          type="text"
          value={text}
          placeholder={editMessage ? "Edit message…" : "Message"}
          onChange={handleChange}
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
