"use client"
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ConfirmLogoutModal from "@/components/common/ConfirmLogoutModal";
import { UserProfile } from "@/types/firestore";
//region Types
/**
 * UserProfile
 *
 * Minimal user profile data displayed in the navbar
 */
export default function Navbar() {
  //region Hooks & State
  /**
   * Authentication state and local UI state
   */
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  //endregion Hooks & State
  //region Refs
  /**
   * Ref for detecting outside clicks on the popover
   */
  const popoverRef = useRef<HTMLDivElement>(null);
  //endregion Refs
  //region Fetch Profile (Realtime)
  /**
   * Subscribes to the current user's profile document
   * and updates navbar display in real time
   */
  useEffect(() => {
    if (!user || !user.uid) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      }
    );
    return () => unsubscribe();
  }, [user?.uid]);
  //endregion Fetch Profile (Realtime)
  //region Outside Click Handler
  /**
   * Closes profile popover when clicking outside
   */
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
  //endregion Outside Click Handler
  //region Helpers
  /**
   * Generates initials from display name or email
   *
   * @param name - Display name or email
   * @returns string - Initials
   */
  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? parts[0][0] + parts[1][0]
      : parts[0][0];
  };
  //endregion Helpers
  //region Logout Handlers
  /**
   * Opens logout confirmation modal
   */
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setOpen(false);
  };
  /**
    * Confirms logout action
    */
  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };
  //endregion Logout Handlers
  //region Render
  /**
   * Renders navbar UI
   */
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      {/* Logo / Title */}
      <h2 className="text-sm font-semibold text-gray-900">
        ChatSphere
      </h2>
      {!loading && user && (
        <div className="relative flex items-center gap-3" ref={popoverRef}>
          {/* Avatar */}
          <button
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition"
          >
            {profile?.photoURL ? (
              <Image
                src={profile.photoURL}
                className="w-8 h-8 rounded-full object-cover"
                width={16}
                height={16}
                alt="Avatar"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
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
          {/* Popover */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-md">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                {profile?.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    className="w-9 h-9 rounded-full"
                    width={16}
                    height={16}
                    alt="Avatar"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(profile?.displayName || user.email || "")}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
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
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                >
                  <Image
                    src="/images/profile.svg"
                    alt="Profile"
                    width={16}
                    height={16}
                    className="opacity-70"
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
                    className="opacity-70"
                  />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <ConfirmLogoutModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />
    </nav>
  );
  //endregion Render
}
//endregion Navbar Component

