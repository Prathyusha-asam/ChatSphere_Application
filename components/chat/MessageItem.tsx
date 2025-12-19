"use client";

import { auth } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteMessage } from "@/lib/messages";
import { useChat } from "@/hooks/useChat";

interface Props {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  createdAt?: {
    toDate: () => Date;
  };
}

export default function MessageItem({
  id,
  text,
  senderId,
  createdAt,
}: Props) {
  const isMine = senderId === auth.currentUser?.uid;

  const { currentConversation } = useChat();

const handleDelete = async () => {
  if (!id || !currentConversation) return;

  await deleteMessage(currentConversation.id, id);
};

  return (
    <div
      className={`flex flex-col max-w-[70%] ${
        isMine ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      <div
        className={`relative px-4 py-2 rounded-lg text-sm ${
          isMine
            ? "bg-purple-600 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {text}

        {isMine && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      {createdAt && (
        <span className="text-[10px] text-gray-400 mt-1">
          {createdAt
            .toDate()
            .toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </span>
      )}
    </div>
  );
}
