"use client";

import { LinkIcon } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { useT } from "@/lib/i18n/client";

// 클라이언트 컴포넌트. 대시보드 상단에 항상 보이는 "내 대시보드 링크" 바.
/**
 * 이 작업공간으로 다시 들어올 수 있는 이동식 대시보드 링크를 계속 보여준다.
 * 로그인이 없으므로, 이 링크가 다른 기기에서 이 대시보드로 돌아오는 유일한 방법이다.
 * (복사 버튼으로 링크를 복사해 저장해 두라는 의미.)
 */
export function DashboardLinkBar({ url }: { url: string }) {
  const t = useT();
  return (
    <div className="border-b bg-primary/5 px-4 py-2.5 md:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <LinkIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="shrink-0">{t("nav.yourDashboardLink")}</span>
          <code className="truncate rounded bg-background px-2 py-0.5 text-xs">
            {url}
          </code>
        </div>
        <CopyButton value={url} label={t("nav.copy")} className="shrink-0" />
      </div>
    </div>
  );
}
