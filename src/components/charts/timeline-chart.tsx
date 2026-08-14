"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_STYLE, GRID_STROKE } from "./chart-theme";
import { ChartTooltip } from "./tooltip";
import { EmptyChart } from "./empty";

interface Point {
  bucket: string;
  clicks: number;
}

export function TimelineChart({ data }: { data: Point[] }) {
  const total = data.reduce((s, d) => s + d.clicks, 0);
  if (total === 0) return <EmptyChart height={260} />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis
          dataKey="bucket"
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={40}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID_STROKE }} />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          fill="url(#fillClicks)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
