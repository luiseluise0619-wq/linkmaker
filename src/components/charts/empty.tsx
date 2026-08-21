"use client";

import { BarChart3 } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function EmptyChart({
  height = 220,
  message,
}: {
  height?: number;
  message?: string;
}) {
  const t = useT();
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 text-muted-foreground"
      style={{ height }}
    >
      <BarChart3 className="h-6 w-6 opacity-50" />
      <p className="text-sm">{message ?? t("misc.noDataYet")}</p>
    </div>
  );
}
