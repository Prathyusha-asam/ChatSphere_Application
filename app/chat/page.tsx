"use client";
import { Suspense } from "react";
import ChatPageClient from "./ChatPageClient";
 //region ChatPage Component
/**
 * ChatPage
 *
 * Entry point for the chat page.
 * - Wraps ChatPageClient with React Suspense
 * - Displays a fallback UI while async components load
 *
 * @returns JSX.Element - Suspense-wrapped chat page
 */
export default function ChatPage() {
    //region Render
  /**
   * Renders chat page with loading fallback
   */
  return (
    <Suspense fallback={<div className="p-4">Loading chat...</div>}>
      <ChatPageClient />
    </Suspense>
  );
 //endregion Render
}
//endregion ChatPage Component