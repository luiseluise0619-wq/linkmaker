// Input(입력창): 한 줄 텍스트 입력을 위한 공용 <input> 래퍼입니다. (shadcn 스타일)
// 표준 input 속성을 그대로 받고, 앱 공통 테두리/포커스 스타일만 입힙니다.
import * as React from "react";
import { cn } from "@/lib/utils";

// forwardRef: 폼 라이브러리 등이 입력창 DOM에 직접 접근할 수 있도록 ref를 전달합니다.
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
