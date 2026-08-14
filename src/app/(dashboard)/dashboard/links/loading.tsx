import { Skeleton } from "@/components/ui/skeleton";

export default function LinksLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
