// 로고(아이콘 + "LinkMaker" 글자). 클릭하면 href로 이동하는 링크다(기본은 홈 "/").
// "LinkMaker"는 브랜드 이름이라 번역하지 않는다.
import Link from "next/link";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Link2 className="h-4 w-4" />
      </span>
      <span className="tracking-tight">LinkMaker</span>
    </Link>
  );
}
