import Skeleton from "@/components/ui/Skeleton";
//region MessageSkeleton Component
/**
 * MessageSkeleton
 *
 * Placeholder skeleton displayed while messages
 * are loading in the chat view.
 *
 * - Mimics avatar and message bubble layout
 * - Improves perceived loading performance
 *
 * @returns JSX.Element - Message loading skeleton
 */
export default function MessageSkeleton() {
  //region Render
  /**
   * Renders message skeleton UI
   */
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <Skeleton className="h-8 w-8 rounded-full" />
      {/* Message */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-44 rounded-full" />
        <Skeleton className="h-3.5 w-64 rounded-full" />
      </div>
    </div>
  );
  //endregion Render
}
//endregion MessageSkeleton Component
