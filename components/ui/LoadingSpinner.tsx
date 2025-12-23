"use client";
//region LoadingSpinner Component
/**
 * LoadingSpinner
 *
 * Reusable animated spinner for indicating loading states.
 * - Size is configurable via props
 * - Used across auth, chat, and async UI flows
 *
 * @param size - Diameter of the spinner in pixels
 * @returns JSX.Element - Loading spinner UI
 */
export default function LoadingSpinner({
  size = 24,
}: {
  size?: number;
}) {
  //region Render
  /**
   * Renders loading spinner
   */
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
      style={{ width: size, height: size }}
    />
  );
  //endregion Render
}
//endregion LoadingSpinner Component
