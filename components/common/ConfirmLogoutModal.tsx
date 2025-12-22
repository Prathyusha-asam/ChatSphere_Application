"use client";

import Image from "next/image";
import { useState } from "react";

/* =======================
   PROPS
======================= */
interface ConfirmLogoutModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>; // 🔑 async-safe
}

/* =======================
   COMPONENT
======================= */
export default function ConfirmLogoutModal({
  open,
  onCancel,
  onConfirm,
}: ConfirmLogoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      await onConfirm();
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Unable to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay (disabled while loading) */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-[360px] bg-white rounded-xl shadow-2xl p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
            <Image
              src="/images/right-arrow.png"
              alt="Logout"
              width={22}
              height={22}
              className="opacity-80"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
          Log out?
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-500 text-center mb-4">
          Are you sure you want to log out?
          <br />
          You will need to sign in again to continue.
        </p>

        {/* Error */}
        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-md py-2
                       text-sm text-gray-700
                       hover:bg-gray-100 transition
                       disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-md py-2
                       bg-black text-white
                       hover:bg-gray-900 transition font-medium
                       disabled:opacity-60"
          >
            {loading ? "Logging out…" : "Log out"}
          </button>
        </div>
      </div>
    </div>
  );
}
