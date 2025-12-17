"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

/**
 * Displays typing indicator for a conversation
 */
interface Props {
  conversationId: string;
}

export default function TypingIndicator({ conversationId }: Props) {
  const { user } = useAuth();

  if (!user) return null;

  const typingUsers = useTypingIndicator(
    conversationId,
    user.uid
  );

  if (typingUsers.length === 0) return null;

  return (
    <p className="text-sm text-gray-500 italic mt-2">
      Someone is typing...
    </p>
  );
}
