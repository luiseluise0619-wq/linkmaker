import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";
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
  const t = getT();
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t("links.pageOf", { current: page, total: pages })}
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
          {t("links.previous")}
        </Link>
        <Link
          href={makeHref(page + 1)}
          aria-disabled={page >= pages}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= pages && "pointer-events-none opacity-50",
          )}
        >
          {t("links.next")}
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}
