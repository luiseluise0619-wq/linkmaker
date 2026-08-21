// "분류 목록"을 막대 비율로 보여주는 컴포넌트(예: 국가별/브라우저별 클릭 순위).
// 각 항목의 클릭수를 전체 대비 퍼센트로 계산해 가로 막대와 %를 그린다.
// 서버 컴포넌트("use client" 없음): 받은 데이터를 그리기만 한다.
import { formatNumber } from "@/lib/utils";
import { EmptyChart } from "./empty";

// label=항목 이름(예: "대한민국"), clicks=그 항목의 클릭수.
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
