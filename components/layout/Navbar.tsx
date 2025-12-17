"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { getUserProfile } from "@/lib/firestore";

/* ---------- Types ---------- */
interface UserProfile {
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [open, setOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    /* ---------- Fetch Profile ---------- */
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const data = await getUserProfile(user.uid);
            if (data) setProfile(data as UserProfile);
        };

        fetchProfile();
    }, [user]);

    /* ---------- Close on outside click ---------- */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const getInitials = (name?: string) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        return parts.length > 1
            ? parts[0][0] + parts[1][0]
            : parts[0][0];
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm relative">
            {/* App Title */}
            <h1 className="text-lg font-bold text-purple-700">
                CHAT SPHERE
            </h1>

            {!loading && user && (
                <div className="relative flex items-center gap-4" ref={popoverRef}>
                    {/* Avatar + Name (vertical) */}
                    <div className="flex flex-col items-center text-center">
                        {profile?.photoURL ? (
                            <img
                                src={profile.photoURL}
                                className="w-9 h-9 rounded-full object-cover"
                                alt="Avatar"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {getInitials(profile?.displayName || user.email || "")}
                            </div>
                        )}
                        <span className="text-xs font-medium mt-1">
                            {profile?.displayName}
                        </span>
                    </div>

                    {/* Hamburger */}
                    <button
                        onClick={() => setOpen((p) => !p)}
                        className="p-2 rounded hover:bg-gray-100"
                    >
                        <Image
                            src="/images/hamburger.svg"
                            alt="Menu"
                            width={22}
                            height={22}
                        />
                    </button>

                    {/* -------- POPOVER -------- */}
                    {open && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-xl shadow-lg">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b">
                                {profile?.photoURL ? (
                                    <img
                                        src={profile.photoURL}
                                        className="w-9 h-9 rounded-full"
                                        alt="Avatar"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                        {getInitials(profile?.displayName || user.email || "")}
                                    </div>
                                )}

                                <div>
                                    <p className="font-medium text-sm">
                                        {profile?.displayName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Menu */}
                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    <Image
                                        src="/images/profile.svg"
                                        alt="Profile"
                                        width={16}
                                        height={16}
                                    />
                                    <span>Profile</span>
                                </Link>

                                <button
                                    onClick={async () => {
                                        await logout();
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    <Image
                                        src="/images/logout.svg"
                                        alt="Logout"
                                        width={16}
                                        height={16}
                                    />
                                    <span>Logout</span>
                                </button>

                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
