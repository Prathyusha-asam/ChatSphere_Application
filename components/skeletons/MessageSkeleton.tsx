import Skeleton from "@/components/ui/Skeleton";

export default function MessageSkeleton() {
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
}
