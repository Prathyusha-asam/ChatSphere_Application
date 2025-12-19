/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserProfile } from "@/lib/firestore";
import StartConversation from "./StartConversation";

interface ConversationItem {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastMessageAt?: {
        toDate: () => Date;
    };
}

interface UserProfile {
    displayName: string;
    photoURL?: string;
}

export default function ConversationList() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCid = searchParams.get("cid");

    const [conversations, setConversations] = useState<
        ConversationItem[]
    >([]);
    const [profiles, setProfiles] = useState<
        Record<string, UserProfile>
    >({});
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const list = snap.docs
                .map(d => ({ id: d.id, ...(d.data() as any) }))
                .filter(c => c.lastMessage && c.lastMessage.trim() !== "");
            setConversations(list);

        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        conversations.forEach(async (c) => {
            const otherId = c.participants.find(
                (p) => p !== user?.uid
            );
            if (!otherId || profiles[otherId]) return;

            const data = await getUserProfile(otherId);
            if (data) {
                setProfiles((p) => ({
                    ...p,
                    [otherId]: {
                        displayName: data.displayName,
                        photoURL: data.photoURL,
                    },
                }));
            }
        });
    }, [conversations]);

    if (!conversations.length) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center">
                <p className="text-gray-400 mb-4">
                    No conversations yet
                </p>
                <button
                    onClick={() => setOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    Start New Chat
                </button>
                {open && (
                    <StartConversation onClose={() => setOpen(false)} />
                )}
            </div>
        );
    }

    return (
        <div className="w-80 border-r h-full flex flex-col">
            <input
                placeholder="Search"
                className="m-3 p-2 border rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex-1 overflow-y-auto">
                {conversations.map((c) => {
                    const otherId =
                        c.participants.find((p) => p !== user?.uid) ||
                        "";
                    const profile = profiles[otherId];

                    if (
                        search &&
                        profile &&
                        !profile.displayName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                    ) {
                        return null;
                    }

                    return (
                        <div
                            key={c.id}
                            onClick={() =>
                                router.push(`/chat?cid=${c.id}`)
                            }
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b ${c.id === activeCid
                                ? "bg-purple-100"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            {profile?.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                    {profile?.displayName?.[0] || "?"}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                    {profile?.displayName || "Loading"}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {c.lastMessage || "No messages yet"}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => setOpen(true)}
                className="m-3 bg-purple-600 text-white py-2 rounded"
            >
                + New Chat
            </button>

            {open && (
                <StartConversation onClose={() => setOpen(false)} />
            )}
        </div>
    );
}
