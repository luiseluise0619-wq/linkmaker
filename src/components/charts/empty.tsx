import { BarChart3 } from "lucide-react";

export function EmptyChart({
  height = 220,
  message = "No data yet",
}: {
  height?: number;
  message?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 text-muted-foreground"
      style={{ height }}
    >
      <BarChart3 className="h-6 w-6 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
