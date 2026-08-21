"use client";

import Link from "next/link";
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
