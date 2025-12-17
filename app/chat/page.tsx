"use client";

import AuthGuard from "@/components/layout/AuthGuard";


export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">
          Welcome to Chat
        </h1>
      </div>
    </AuthGuard>
  );
}
