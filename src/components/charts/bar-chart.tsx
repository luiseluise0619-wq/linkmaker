// 막대그래프(예: 시간대별/요일별 클릭수)를 그리는 컴포넌트. recharts 라이브러리 사용.
// 클라이언트 컴포넌트: 차트는 브라우저에서 크기에 맞춰 그려지고 마우스에 반응한다.
// 데이터 합이 0이면 빈 상태(EmptyChart)를 보여준다.
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_STYLE, GRID_STROKE } from "./chart-theme";
import { ChartTooltip } from "./tooltip";
import { EmptyChart } from "./empty";

interface SimpleBarProps {
  data: { label: string; clicks: number }[];
  height?: number;
}

export function SimpleBarChart({ data, height = 240 }: SimpleBarProps) {
  const total = data.reduce((s, d) => s + d.clicks, 0);
  if (total === 0) return <EmptyChart height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={40}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
        />
        <Bar dataKey="clicks" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
