"use client";
//region Skeleton Component
/**
 * Skeleton
 *
 * Base skeleton component used to build
 * loading placeholders across the application.
 *
 * - Supports custom sizing via className
 * - Uses pulse animation for loading feedback
 *
 * @param className - Additional Tailwind classes for size & shape
 * @returns JSX.Element - Skeleton placeholder
 */
export default function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  //region Render
  /**
   * Renders skeleton placeholder
   */
  return (
    <div
      className={`animate-pulse rounded bg-gray-200/80 ${className}`}
    />
  );
  //endregion Render
}
//endregion Skeleton Component
