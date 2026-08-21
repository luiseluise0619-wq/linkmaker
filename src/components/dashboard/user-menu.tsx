// 오른쪽 위 동그란 아바타(W) 버튼을 누르면 열리는 드롭다운 메뉴.
// 설정 이동 / 다른 기기에서 열기(대시보드 링크) / 새 작업공간 시작(현재 세션 종료)을 담는다.
// 클라이언트 컴포넌트: 드롭다운 열고 닫는 상호작용이 필요하다.
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
