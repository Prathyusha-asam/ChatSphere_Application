"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ConfirmLogoutModal from "@/components/common/ConfirmLogoutModal";

/* =======================
   TYPES
======================= */
interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
}

/* =======================
   NAVBAR
======================= */
export default function Navbar() {
  const { user, loading, logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  /* =======================
     REAL-TIME PROFILE
  ======================= */
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    });

    return () => unsubscribe();
  }, [user]);

  /* =======================
     CLOSE POPOVER ON OUTSIDE CLICK
  ======================= */
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

  /* =======================
     HELPERS
  ======================= */
  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? parts[0][0] + parts[1][0]
      : parts[0][0];
  };

  /* =======================
     LOGOUT HANDLERS
  ======================= */
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setOpen(false);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };

  /* =======================
     UI
  ======================= */
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      {/* App Title */}
      <Link href="/" className="text-sm font-semibold text-purple-700">
        ChatSphere
      </Link>

      {!loading && user && (
        <div className="relative flex items-center gap-3" ref={popoverRef}>
          {/* Avatar + Name + Hamburger */}
          <button
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition"
          >
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                className="w-8 h-8 rounded-full object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {getInitials(profile?.displayName || user.email || "")}
              </div>
            )}

            <span className="hidden sm:block text-sm font-medium text-gray-800">
              {profile?.displayName}
            </span>

            <Image
              src="/images/hamburger.svg"
              alt="Menu"
              width={16}
              height={16}
              className="opacity-60"
            />
          </button>

          {/* =======================
             POPOVER MENU
          ======================= */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    className="w-9 h-9 rounded-full"
                    alt="Avatar"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(profile?.displayName || user.email || "")}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {profile?.displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Menu */}
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition"
                >
                  <Image
                    src="/images/profile.svg"
                    alt="Profile"
                    width={16}
                    height={16}
                  />
                  Profile
                </Link>

                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                >
                  <Image
                    src="/images/logout.svg"
                    alt="Logout"
                    width={16}
                    height={16}
                  />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =======================
         LOGOUT CONFIRM MODAL
      ======================= */}
      <ConfirmLogoutModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />
    </nav>
  );
}
