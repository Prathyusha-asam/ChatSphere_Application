"use client";

import { auth } from "@/lib/firebase";

interface MessageItemProps {
  text: string;
  senderName: string;
  senderId: string;
  createdAt?: {
    toDate: () => Date;
  };
  showSender: boolean;
}

export default function MessageItem({
  text,
  senderId,
  createdAt,
}: MessageItemProps) {
  const isMine = senderId === auth.currentUser?.uid;

  return (
    <div
      className={`flex flex-col max-w-[70%] ${
        isMine ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >

      <div
        className={`px-4 py-2 rounded-lg text-sm ${
          isMine
            ? "bg-purple-600 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {text}
      </div>

      {createdAt && (
        <span className="text-[10px] text-gray-400 mt-1">
          {createdAt.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
