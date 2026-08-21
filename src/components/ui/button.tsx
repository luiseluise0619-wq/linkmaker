// Button(버튼): 앱 전체에서 쓰는 공용 버튼 primitive입니다. (shadcn 스타일)
// variant(색/모양)와 size(크기)를 골라 쓸 수 있고, asChild로 다른 태그처럼 렌더링할 수도 있습니다.
import * as React from "react";
// Slot(Radix): asChild가 true일 때, <button> 대신 자식 요소(예: <a>, <Link>)에 스타일만 입혀줍니다.
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// buttonVariants: 공통 클래스 + variant(default/outline/ghost 등) + size(default/sm/lg/icon)별 클래스를 정의합니다.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

// ButtonProps: 기본 button 속성 + variant/size + asChild(자식 요소로 대체할지) 옵션
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// forwardRef: 부모가 이 버튼의 실제 DOM 요소에 ref로 접근할 수 있게 넘겨주는 방식입니다.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // asChild면 자식 태그(Slot)를, 아니면 실제 <button>을 렌더링합니다.
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
