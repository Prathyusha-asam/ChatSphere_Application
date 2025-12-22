import Skeleton from "@/components/ui/Skeleton";

export default function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Avatar */}
      <Skeleton className="h-9 w-9 rounded-full" />

      {/* Text */}
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
