/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;
      const data = await getUserProfile(auth.currentUser.uid);
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);   

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>
      <p>Email: {profile.email}</p>
      <p>Name: {profile.displayName}</p>
    </div>
  );
}
