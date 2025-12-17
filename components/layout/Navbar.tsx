"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

// #region Navbar Component
// Displays application title globally
// Shows hamburger menu and logout only when the user is logged in
export default function Navbar() {

  // #region Authentication State
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  // #endregion Authentication State

  return (
    // #region Navbar Container
    <nav className="flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm">
      
      {/* #region Application Title */}
      <h1 className="text-lg font-bold text-purple-700 tracking-wide">
        CHAT SPHERE
      </h1>
      {/* #endregion Application Title */}

      {/* #region Authenticated Actions */}
      {isLoggedIn && (
        <div className="flex items-center gap-4">
          
          {/* Hamburger Menu */}
          <button>
            <Image
              src="/images/hamburger.svg"
              alt="Menu"
              width={22}
              height={22}
            />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Logout
          </button>

        </div>
      )}
      {/* #endregion Authenticated Actions */}

    </nav>
    // #endregion Navbar Container
  );
}
// #endregion Navbar Component
