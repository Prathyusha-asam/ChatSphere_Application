"use client";
import { useContext } from "react";
import { ChatContext } from "@/context/ChatContext";
import { ChatContextType } from "@/types/firestore";
export function useChat(): ChatContextType {
  //region Use Chat Context
  /**
   * Retrieves the chat context
   */
  const context = useContext(ChatContext);
  //endregion
  //region Validate Context
  /**
   * Ensures useChat is called within ChatProvider
   */
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  //endregion
  // region return Context
  /**
   * Returns the validated chat context
   */
  return context;
}