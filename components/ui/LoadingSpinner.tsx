"use client";

export default function LoadingSpinner({
  size = 24,
}: {
  size?: number;
}) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"
      style={{ width: size, height: size }}
    />
  );
}
