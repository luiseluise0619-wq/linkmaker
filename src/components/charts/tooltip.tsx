// 차트에서 마우스를 올렸을 때 뜨는 작은 말풍선(툴팁). 해당 지점의 값을 보여준다.
// recharts가 active/payload/label 정보를 넘겨주면 그걸 예쁘게 그려 준다.
"use client";

import type { TooltipProps } from "recharts";
import { formatNumber } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel,
}: TooltipProps<number, string> & { valueLabel?: string }) {
  const t = useT();
  const resolvedValueLabel = valueLabel ?? t("misc.clicks");
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {resolvedValueLabel}:{" "}
          <span className="font-medium text-popover-foreground">
            {formatNumber(Number(entry.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
}
