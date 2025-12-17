"use client";

import AuthGuard from "@/components/layout/AuthGuard";



export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">
          Profile Page
        </h1>
      </div>
    </AuthGuard>
  );
}
