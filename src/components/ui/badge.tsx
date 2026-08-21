// Badge(배지): 상태나 분류를 나타내는 작고 둥근 라벨 UI 조각입니다.
// shadcn 스타일의 기본 primitive이며, cva로 색상 variant(종류)를 미리 정의해 둡니다.
import * as React from "react";
// cva(class-variance-authority): variant 이름에 따라 서로 다른 Tailwind 클래스 묶음을 골라주는 도구입니다.
import { cva, type VariantProps } from "class-variance-authority";
// cn: 여러 className 문자열을 안전하게 합쳐주는 헬퍼입니다.
import { cn } from "@/lib/utils";

// badgeVariants: 첫 인자는 항상 적용되는 기본 클래스, variants 안에는 종류별(default/success 등) 색상 클래스입니다.
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success:
          "border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
        destructive:
          "border-transparent bg-destructive/12 text-destructive",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

// BadgeProps: 일반 div의 모든 속성 + variant(색상 종류) prop을 받을 수 있습니다.
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Badge 컴포넌트: variant에 맞는 스타일을 입힌 div 하나를 그립니다. (특별한 동작 없이 화면 표시만)
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
