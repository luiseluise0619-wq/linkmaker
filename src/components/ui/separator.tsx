// Separator(구분선): 내용을 나누는 얇은 선입니다. orientation으로 가로선/세로선을 선택합니다.
import * as React from "react";
import { cn } from "@/lib/utils";

// role="separator": 이 요소가 구분선임을 보조기기에 알려주는 접근성 표시입니다.
const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
  }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
