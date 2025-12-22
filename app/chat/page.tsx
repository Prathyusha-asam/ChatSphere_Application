"use client";
 
import { Suspense } from "react";
import ChatPageClient from "./ChatPageClient";
 
export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading chat...</div>}>
      <ChatPageClient />
    </Suspense>
  );
}
