import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
