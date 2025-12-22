"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";


/* ---------- Types ---------- */
interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: {
    toDate: () => Date;
  };
}

/* ---------- Preset Avatars ---------- */
const PRESET_AVATARS = [
  "/images/avatar1.jpg",
  "/images/avatar2.jpg",
  "/images/avatar3.jpg",
  "/images/avatar4.jpg",
  "/images/avatar5.jpg",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : parts[0][0].toUpperCase() +
      parts[parts.length - 1][0].toUpperCase();
  };

  /* ---------- Fetch Profile ---------- */
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setError("");
        const data = await getUserProfile(user.uid);

        if (data) {
          setProfile(data as UserProfile);
          setDisplayName(data.displayName || "");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Unable to load profile. Please try again.");
      }
    };

    fetchProfile();
  }, [user]);

  /* ---------- Guards ---------- */
  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading profile…</p>;
  }

  if (!user) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Please sign in to view your profile.
      </p>
    );
  }

  const currentUser = user;

  /* ---------- Save Display Name ---------- */
  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Display name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateUserProfile(currentUser.uid, { displayName });
      setSuccess("Profile updated successfully");
      router.back();
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Select Avatar ---------- */
  const handleAvatarSelect = async (avatarUrl: string) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateUserProfile(currentUser.uid, { photoURL: avatarUrl });
      setProfile((prev) =>
        prev ? { ...prev, photoURL: avatarUrl } : prev
      );

      setSuccess("Profile picture updated");
    } catch {
      setError("Failed to update avatar");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <AuthGuard>
      <div className="flex justify-center mt-10 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Your profile
          </h2>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            {profile?.photoURL ? (
              <Image
                src={profile.photoURL}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
                width={16}
                height={16}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-semibold">
                {getInitials(displayName)}
              </div>
            )}
          </div>

          {/* Avatar Picker */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 text-center mb-3">
              Choose a profile picture
            </p>

            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`w-12 h-12 rounded-full border-2 transition
                    ${profile?.photoURL === avatar
                      ? "border-gray-900"
                      : "border-transparent hover:border-gray-300"
                    }`}
                >
                  <Image
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                    width={16}
                    height={16}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>
              <span className="font-medium text-gray-800">Email:</span>{" "}
              {currentUser.email}
            </p>
            <p>
              <span className="font-medium text-gray-800">
                Account created:
              </span>{" "}
              {profile?.createdAt?.toDate().toLocaleDateString() || "—"}
            </p>
          </div>

          {/* Display Name */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white
                       px-3 py-2 mb-4 text-sm text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-black py-2.5 text-sm font-medium text-white
               hover:bg-gray-800 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-gray-300
               py-2.5 text-sm font-medium text-gray-700
               hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>


          {/* Messages */}
          {success && (
            <p className="mt-4 text-sm text-green-600 text-center">
              {success}
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          {error && (
            <div className="mt-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-1 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}
