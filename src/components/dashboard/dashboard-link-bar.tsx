"use client";

import { LinkIcon } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { useT } from "@/lib/i18n/client";

/**
 * Persistent reminder of the workspace's portable dashboard link — the only
 * way back to this anonymous dashboard on another device.
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
