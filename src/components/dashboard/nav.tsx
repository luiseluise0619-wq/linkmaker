// 대시보드 왼쪽 사이드바의 메뉴(대시보드/링크/분석/캠페인/설정).
// "use client" = 클라이언트 컴포넌트. 현재 주소(usePathname)를 읽어 어떤 메뉴가
// 활성 상태인지 표시해야 하므로 브라우저에서 동작한다.
"use client";

import Link from "next/link";
// usePathname = 지금 보고 있는 페이지의 경로(예: "/dashboard/links")를 알려주는 훅.
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Link2,
  Megaphone,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

// 메뉴 목록. label은 번역 키 → 화면에서 t(label)로 현재 언어 문구로 바뀐다.
// exact: true면 주소가 정확히 일치할 때만 활성(하위 경로는 별개 메뉴).
export const NAV_ITEMS = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/links", label: "nav.links", icon: Link2 },
  { href: "/dashboard/links/new", label: "nav.createLink", icon: Plus, exact: true },
  { href: "/dashboard/analytics", label: "nav.analytics", icon: BarChart3 },
  { href: "/dashboard/campaigns", label: "nav.campaigns", icon: Megaphone },
  { href: "/dashboard/settings", label: "nav.settings", icon: Settings },
];

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href ||
            (pathname.startsWith(item.href + "/") &&
              item.href !== "/dashboard");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
