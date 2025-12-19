/* eslint-disable @next/next/no-img-element */
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
    const [open, setOpen] = useState(false);

    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [search, setSearch] = useState("");
    const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<ConversationItem, "id">),
            }));

            setConversations(list);
        });

        return () => unsubscribe();
    }, [user]);

    const loadProfile = async (uid: string) => {
        if (profiles[uid]) return;

        const data = await getUserProfile(uid);
        if (data) {
            setProfiles((prev) => ({
                ...prev,
                [uid]: {
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                },
            }));
        }
    };

    if (!conversations.length) {
        return (
            <div className="p-4 text-gray-500 text-sm">
                No conversations yet
            </div>
        );
    }

    return (
        <div className="w-80 border-r h-full flex flex-col">
            <input
                placeholder="Search conversations"
                className="m-3 px-3 py-2 border rounded text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex-1 overflow-y-auto">
                {conversations.map((c) => {
                    const otherUserId =
                        c.participants.find((p) => p !== user?.uid) || "";

                    loadProfile(otherUserId);

                    const profile = profiles[otherUserId];

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
                            onClick={() => router.push(`/chat?cid=${c.id}`)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b ${c.id === activeCid
                                    ? "bg-purple-100"
                                    : "hover:bg-gray-100"
                                }`}
                        >
                            {/* Avatar */}
                            {profile?.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    className="w-10 h-10 rounded-full object-cover"
                                    alt="Avatar"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                                    {profile?.displayName?.[0] || "?"}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                    {profile?.displayName || "Loading..."}
                                </div>

                                <div className="text-xs text-gray-500 truncate">
                                    {c.lastMessage || "No messages yet"}
                                </div>
                            </div>

                            {/* Time */}
                            {c.lastMessageAt && (
                                <div className="text-[10px] text-gray-400 whitespace-nowrap">
                                    {c.lastMessageAt
                                        .toDate()
                                        .toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <button
                onClick={() => setOpen(true)}
                className="m-3 flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
                + New Chat
            </button>

            {open && <StartConversation onClose={() => setOpen(false)} />}


        </div>

    );
}
