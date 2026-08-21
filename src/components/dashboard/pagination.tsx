// 목록을 여러 쪽으로 나눠 보여줄 때의 "이전/다음" 페이지 버튼.
// 서버 컴포넌트("use client" 없음): 각 버튼은 그냥 다른 쪽 주소로 가는 링크다.
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server"; // 서버에서 현재 언어 문구를 가져오는 함수
import { cn } from "@/lib/utils";

// page=현재 쪽, pages=전체 쪽 수, makeHref=특정 쪽의 주소를 만들어 주는 함수.
export function Pagination({
  page,
  pages,
  makeHref,
}: {
  page: number;
  pages: number;
  makeHref: (page: number) => string;
}) {
  if (pages <= 1) return null; // 한 쪽뿐이면 페이지 버튼을 아예 안 보여준다
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
