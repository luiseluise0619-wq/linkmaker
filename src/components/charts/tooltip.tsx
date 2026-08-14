"use client";

import type { TooltipProps } from "recharts";
import { formatNumber } from "@/lib/utils";

export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Clicks",
}: TooltipProps<number, string> & { valueLabel?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {valueLabel}:{" "}
          <span className="font-medium text-popover-foreground">
            {formatNumber(Number(entry.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
}
