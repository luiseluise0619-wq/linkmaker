// Textarea(여러 줄 입력창): 긴 글(설명 등)을 입력하는 <textarea> 래퍼입니다. (shadcn 스타일)
import * as React from "react";
import { cn } from "@/lib/utils";

// forwardRef로 부모가 이 입력창 DOM에 접근할 수 있게 합니다.
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
