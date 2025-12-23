"use client";
import Image from "next/image";
import { EmptyStateProps } from "@/types/firestore";
//region EmptyState Component
/**
 * EmptyState
 *
 * Generic reusable empty-state component.
 * - Displays icon, title, and optional description
 * - Optionally renders a call-to-action button
 * - Used across lists, chats, and error states
 *
 * @param props - Empty state configuration
 * @returns JSX.Element - Empty state UI
 */
export default function EmptyState({
  title,
  description,
  icon = "/images/empty-box.svg",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  //region Render
  /**
   * Renders empty state UI
   */
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 text-gray-500">
      <Image
        src={icon}
        alt="Empty state"
        width={96}
        height={96}
        className="mb-4 opacity-80"
      />
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white
                     hover:bg-gray-800 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
  //endregion Render
}
//endregion EmptyState Component
