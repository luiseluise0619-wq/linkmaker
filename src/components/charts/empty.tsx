// 차트에 보여줄 데이터가 없을 때 자리에 표시하는 "데이터 없음" 안내.
// 클라이언트 컴포넌트(현재 언어 문구를 useT로 가져옴).
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
