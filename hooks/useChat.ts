"use client";

import { useContext } from "react";
import { ChatContext, ChatContextType } from "@/context/ChatContext";

/**
 * Custom hook for accessing ChatContext safely
 */
export function useChat(): ChatContextType {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
}
