import { formatNumber } from "@/lib/utils";
import { EmptyChart } from "./empty";

interface Item {
  label: string;
  clicks: number;
}

export function BreakdownList({
  data,
  emptyMessage,
}: {
  data: Item[];
  emptyMessage?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.clicks));
  const total = data.reduce((s, d) => s + d.clicks, 0);
  if (total === 0) return <EmptyChart height={180} message={emptyMessage} />;

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = Math.round((item.clicks / total) * 100);
        return (
          <div key={`${item.label}-${i}`} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate pr-2" title={item.label}>
                {item.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatNumber(item.clicks)}
                <span className="ml-1 text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${(item.clicks / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
