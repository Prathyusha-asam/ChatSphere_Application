import Skeleton from "@/components/ui/Skeleton";
//region ProfileSkeleton Component
/**
 * ProfileSkeleton
 *
 * Placeholder skeleton displayed while profile
 * information is loading.
 *
 * - Mimics avatar and text layout
 * - Improves perceived loading experience
 *
 * @returns JSX.Element - Profile loading skeleton
 */
export default function ProfileSkeleton() {
  //region Render
  /**
   * Renders profile skeleton UI
   */
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Avatar */}
      <Skeleton className="h-10 w-10 rounded-full" />
      {/* Text */}
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  );
  //endregion Render
}
//endregion ProfileSkeleton Component
