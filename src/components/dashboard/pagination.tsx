import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  makeHref,
}: {
  page: number;
  pages: number;
  makeHref: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <Link
          href={makeHref(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
        >
          <ChevronLeft />
          Previous
        </Link>
        <Link
          href={makeHref(page + 1)}
          aria-disabled={page >= pages}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= pages && "pointer-events-none opacity-50",
          )}
        >
          Next
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}
