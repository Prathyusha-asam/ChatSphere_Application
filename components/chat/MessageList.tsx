"use client";

import TypingIndicator from "./TypingIndicator";

/**
 * Message list component
 * Currently only shows typing indicator
 * Messages will be added later
 */
interface Props {
  conversationId: string;
}

export default function MessageList({ conversationId }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Messages will render here later */}

      {/* Typing indicator */}
      <TypingIndicator conversationId={conversationId} />
    </div>
  );
}
