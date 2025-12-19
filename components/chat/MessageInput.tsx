"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { useChat } from "@/hooks/useChat";
import { setTypingStatus } from "@/lib/typing";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput() {
  const { currentConversation, sendMessage, loading } = useChat();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const emojiRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;
    setTypingStatus(currentConversation.id, auth.currentUser.uid, !!text);
  }, [text, currentConversation]);

  const handleSend = async () => {
    if (!text.trim() || !currentConversation) return;
    await sendMessage(text);
    setText("");
    setShowEmoji(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowEmoji((p) => !p)}
        className="text-xl"
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
        className="flex-1 border p-2 rounded"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-purple-600 text-white px-4 rounded"
      >
        Send
      </button>
    </div>
  );
}
