"use client";

import { LogOut, Plus, Settings as SettingsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { useT } from "@/lib/i18n/client";

export function UserMenu({ dashboardHref }: { dashboardHref: string }) {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={t("nav.workspaceMenu")}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            W
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate">{t("nav.yourWorkspace")}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {t("nav.anonymousNoAccount")}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard/settings">
            <SettingsIcon />
            {t("nav.settingsAndDashboardLink")}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={dashboardHref}>
            <Plus />
            {t("nav.openOnAnotherDevice")}
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logoutAction} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut />
              {t("nav.startNewWorkspace")}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
