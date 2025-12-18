"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";

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

/* ---------- Component ---------- */
export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ---------- Helpers ---------- */
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (
      parts[0][0].toUpperCase() +
      parts[parts.length - 1][0].toUpperCase()
    );
  };

  /* ---------- Fetch Profile ---------- */
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user.uid);
        if (data) {
          setProfile(data as UserProfile);
          setDisplayName(data.displayName || "");
        }
      } catch {
        setError("Failed to load profile");
      }
    };

    fetchProfile();
  }, [user]);

  /* ---------- Guards ---------- */
  if (loading) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  if (!user) {
    return (
      <p className="text-center mt-10">
        Please log in to view your profile.
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

      await updateUserProfile(currentUser.uid, {
        photoURL: avatarUrl,
      });

      setProfile((prev) =>
        prev ? { ...prev, photoURL: avatarUrl } : prev
      );

      setSuccess("Profile avatar updated");
    } catch {
      setError("Failed to update avatar");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <AuthGuard>
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Your Profile
        </h2>

        {/* Avatar / Initials */}
        <div className="flex justify-center mb-4">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(displayName)}
            </div>
          )}
        </div>

        {/* Avatar Picker */}
        <div className="mb-6">
          <p className="text-sm font-medium text-center mb-2">
            Choose an Avatar
          </p>

          <div className="grid grid-cols-5 gap-3 justify-items-center">
            {PRESET_AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarSelect(avatar)}
                className={`w-12 h-12 rounded-full border-2 ${
                  profile?.photoURL === avatar
                    ? "border-purple-600"
                    : "border-transparent"
                }`}
              >
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Email */}
        <p className="text-gray-700 mb-2">
          <strong>Email:</strong> {currentUser.email}
        </p>

        {/* Created Date */}
        <p className="text-gray-700 mb-4">
          <strong>Account Created:</strong>{" "}
          {profile?.createdAt?.toDate().toLocaleDateString() || "—"}
        </p>

        {/* Edit Name */}
        <label className="block mb-2 font-medium">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full mt-2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100"
        >
          Cancel
        </button>

        {/* Messages */}
        {success && (
          <p className="text-green-600 mt-4 text-center">
            {success}
          </p>
        )}
        {error && (
          <p className="text-red-600 mt-4 text-center">
            {error}
          </p>
        )}
      </div>
    </AuthGuard>
  );
}
