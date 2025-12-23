"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/firestore";
import Image from "next/image";
//region Types
/**
 * UserProfile
 *
 * Represents a public user profile fetched from Firestore
 */
interface UserProfile {
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt?: {
        toDate: () => Date;
    };
}
//endregion Types

//region OtherUserProfilePage Component
/**
 * OtherUserProfilePage
 *
 * Displays another user's public profile.
 * - Fetches user profile using UID from route params
 * - Handles loading and error states
 * - Displays avatar, name, email, and join date
 * - Protected by AuthGuard
 *
 * @returns JSX.Element - User profile page
 */
export default function OtherUserProfilePage() {
     //region Hooks & State
    /**
     * Route params and navigation
     */
    const { uid } = useParams<{ uid: string }>();
    const router = useRouter();
    /**
     * Local state
     * - profile: fetched user profile data
     * - loading: loading indicator
     * - error: error message
     */
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
 //endregion Hooks & State

    //region Helpers
    /**
     * getInitials
     *
     * Generates initials from a display name
     *
     * @param name - User display name
     * @returns string - Uppercase initials
     */
    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : parts[0][0].toUpperCase() +
            parts[parts.length - 1][0].toUpperCase();
    };
//endregion Helpers

    //region Side Effects
    /**
     * useEffect
     *
     * Purpose:
     * - Fetches user profile when UID changes
     *
     * Behavior:
     * - Shows error if user not found
     * - Handles loading and failure states
     */
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
 //endregion Side Effects

    //region Conditional Rendering
    /**
     * Loading state
     */
    if (loading) {
        return <p className="text-center mt-10">Loading profile…</p>;
    }
 /**
     * Error or missing profile state
     */
    if (error || !profile) {
        return <p className="text-center mt-10 text-red-600">{error}</p>;
    }
//endregion Conditional Rendering

    //region Render
    /**
     * Renders user profile details
     */
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
 //endregion Render
}
//endregion OtherUserProfilePage Component
