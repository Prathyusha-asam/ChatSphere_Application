/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { setTypingStatus } from "@/lib/typing";
import { useChat } from "@/hooks/useChat";
import EmojiPicker from "emoji-picker-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import Image from "next/image";
//region Constants
/**
 * Maximum allowed characters per message
 */
const MAX_CHARS = 500;
//endregion Constants
//region MessageInput Component
/**
 * MessageInput
 *
 * Composer for sending, editing, and replying to messages.
 * - Supports emoji picker and image selection
 * - Handles typing indicators with debounce
 * - Supports Ctrl/Alt + Enter for new line
 * - Handles edit & reply modes
 *
 * @returns JSX.Element | null - Message input UI
 */
export default function MessageInput() {
  //region Chat Context
  /**
   * Chat state and actions
   */
  const {
    currentConversation,
    sendMessage,
    loading,
    replyTo,
    editMessage,
    clearComposerState,
  } = useChat();
  //endregion Chat Context
  //region Local State
  /**
   * Local composer state
   */
  const [text, setText] = useState(editMessage?.text ?? "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [error, setError] = useState("");
  //endregion Local State
  //region Refs
  /**
   * Refs for debouncing, emoji picker, and file input
   */
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  //endregion Refs
  //region Typing Indicator
  /**
   * Updates typing status with debounce
   */
  useEffect(() => {
    if (!auth.currentUser || !currentConversation) return;
    if (!text.trim()) {
      setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
      return;
    }
    setTypingStatus(currentConversation.id, auth.currentUser.uid, true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(currentConversation.id, auth.currentUser!.uid, false);
    }, 2000);
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, currentConversation]);
  //endregion Typing Indicator
  //region Emoji Picker Outside Click
  /**
   * Closes emoji picker when clicking outside
   */
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
  //endregion Emoji Picker Outside Click
  //region Send Message
  /**
   * Validates and sends a text message
   */
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
      setShowEmoji(false);
      clearComposerState();
      setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };
  //endregion Send Message
  //region File Picker
  /**
   * Opens native file picker
   */
  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };
  /**
     * Handles image selection
     *
     * @param e - File input change event
     */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentConversation || !auth.currentUser) return;
    try {
      // TEMP: sending filename (storage upload comes next step)
      await sendMessage(`[image] ${file.name}`);
      setTypingStatus(
        currentConversation.id,
        auth.currentUser.uid,
        false
      );
    } catch {
      setError("Failed to send image");
    } finally {
      e.target.value = "";
    }
  };
  //endregion File Picker
  //region Cleanup
  /**
   * Clears typing status on unmount
   */
  useEffect(() => {
    return () => {
      if (auth.currentUser && currentConversation) {
        setTypingStatus(currentConversation.id, auth.currentUser.uid, false);
      }
    };
  }, [currentConversation]);
  //endregion Cleanup
  //region Guard
  /**
   * Hide input when no conversation is active
   */
  if (!currentConversation) return null;
  //endregion Guard
  //region Render
  /**
   * Renders message composer UI
   */
  return (
    <div className="relative" key={editMessage?.id ?? "new-message"}>
      {(replyTo || editMessage) && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs">
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
        {/* EMOJI BUTTON (UNCHANGED) */}
        <button
          type="button"
          onClick={() => setShowEmoji((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-full
                     text-gray-600 hover:bg-gray-100 transition"
        >
          <Image src="/images/smiley.svg" alt="Emoji" width={22} height={22} />
        </button>
        {/* Image Picker */}
        <button
          type="button"
          onClick={handleOpenFilePicker}
          className="flex h-10 w-10 items-center justify-center rounded-full
                     text-gray-600 hover:bg-gray-100 transition"
        >
          <Image src="/images/image.png" alt="Emoji" width={22} height={22} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
        {showEmoji && (
          <div ref={emojiRef} className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker
              onEmojiClick={(e) => setText((prev) => prev + e.emoji)}
            />
          </div>
        )}
        {/* Textarea */}
        <textarea
          placeholder={editMessage ? "Edit message…" : "Message"}
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.ctrlKey || e.altKey) {
                e.preventDefault();
                setText((prev) => prev + "\n");
                return;
              }
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 resize-none rounded-2xl border border-gray-300 bg-white
             px-4 py-2 text-sm text-gray-900
             focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        />
        {/* Send Button */}
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
      {/* Footer */}
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
  //endregion Render
}
//endregion MessageInput Component
