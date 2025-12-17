"use client";

import Image from "next/image";

// #region Navbar Component
// Displays application title globally
// Shows hamburger menu only when the user is logged in
export default function Navbar() {
    // #region Temporary Authentication Flag
    // This flag is used only for UI testing
    const isLoggedIn = false;
    // #endregion Temporary Authentication Flag
    return (
        //  Navbar Container
        <nav className="flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm">
            {/* #region Application Title */}
            <h1 className="text-lg font-bold text-purple-700 tracking-wide">
                CHAT SPHERE
            </h1>

            {/*  Hamburger Menu (Visible After Login) */}
            {isLoggedIn && (
                <button>
                    <Image
                        src="/hamburger.svg"
                        alt="Menu"
                        width={22}
                        height={22}
                    />
                </button>
            )}
        </nav>
        // #endregion Navbar Container
    );
}
// #endregion Navbar Component