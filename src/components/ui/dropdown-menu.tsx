// DropdownMenu(드롭다운 메뉴): 버튼을 누르면 아래로 펼쳐지는 메뉴 목록 primitive입니다.
// Radix의 DropdownMenu를 감싸 앱 스타일을 입힌 것입니다. "use client"이므로 브라우저에서 동작합니다.
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

// 아래는 Radix 원본을 그대로 이름만 바꿔 내보냅니다.
const DropdownMenu = DropdownMenuPrimitive.Root; // Root: 메뉴 전체를 감싸며 열림 상태 관리
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger; // Trigger: 누르면 메뉴를 여는 버튼
const DropdownMenuGroup = DropdownMenuPrimitive.Group; // Group: 항목들을 묶는 그룹
const DropdownMenuPortal = DropdownMenuPrimitive.Portal; // Portal: 메뉴를 body 최상단에 렌더링
const DropdownMenuSub = DropdownMenuPrimitive.Sub; // Sub: 하위(중첩) 메뉴
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup; // RadioGroup: 하나만 선택되는 항목 묶음

// DropdownMenuContent: 실제로 펼쳐지는 메뉴 상자. Portal로 띄우고 열림/닫힘 애니메이션이 붙습니다.
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[9rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// DropdownMenuItem: 메뉴 안의 클릭 가능한 한 줄 항목. inset이면 왼쪽 여백을 더 줍니다.
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// DropdownMenuLabel: 클릭 안 되는 제목/구분용 글자 (예: "내 워크스페이스")
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// DropdownMenuSeparator: 메뉴 항목 사이를 나누는 얇은 가로선
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName =
  DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
};
