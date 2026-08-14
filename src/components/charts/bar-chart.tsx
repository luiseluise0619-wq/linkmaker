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
