"use client";

import Image from "next/image";

/* =======================
   PROPS
======================= */
interface ConfirmLogoutModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/* =======================
   COMPONENT
======================= */
export default function ConfirmLogoutModal({
  open,
  onCancel,
  onConfirm,
}: ConfirmLogoutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onCancel}
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
        <p className="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to log out?
          <br />
          You will need to sign in again to continue.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 rounded-md py-2
                       text-sm text-gray-700
                       hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-md py-2
                       bg-black text-white
                       hover:bg-gray-900 transition font-medium"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
