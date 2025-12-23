"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/firestore";
import Image from "next/image";

interface UserProfile {
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt?: {
        toDate: () => Date;
    };
}

export default function OtherUserProfilePage() {
    const { uid } = useParams<{ uid: string }>();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : parts[0][0].toUpperCase() +
            parts[parts.length - 1][0].toUpperCase();
    };

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getUserProfile(uid);
                if (!data) {
                    setError("User not found");
                } else {
                    setProfile(data as UserProfile);
                }
            } catch {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [uid]);

    if (loading) {
        return <p className="text-center mt-10">Loading profile…</p>;
    }

    if (error || !profile) {
        return <p className="text-center mt-10 text-red-600">{error}</p>;
    }

    return (
        <AuthGuard>
            <div className="flex justify-center mt-10 px-4">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm">

                    {/* Back */}
                    <button
                        onClick={() => router.back()}
                        className="text-sm mb-4 underline"
                    >
                        ← Back
                    </button>

                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                        {profile.displayName}
                    </h2>


                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                        {profile.photoURL ? (
                            <Image
                                src={profile.photoURL}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover"
                                width={96}
                                height={96}
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-semibold">
                                {getInitials(profile.displayName)}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium text-gray-900">
                            {profile.displayName}
                        </p>

                        <p className="text-sm text-gray-600">
                            {profile.email}
                        </p>

                        <p className="text-xs text-gray-500">
                            Joined on{" "}
                            {profile.createdAt?.toDate().toLocaleDateString() || "—"}
                        </p>
                    </div>

                </div>
            </div>
        </AuthGuard>
    );
}
