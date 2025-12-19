import Skeleton from "@/components/ui/Skeleton";

export default function MessageSkeleton() {
  return (
    <div className="flex gap-2 mb-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
