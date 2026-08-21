// Dialog(다이얼로그/모달): 화면 위에 겹쳐 떠오르는 팝업 창 primitive입니다.
// Radix UI의 Dialog를 감싸서 앱 스타일(어두운 배경, 가운데 정렬 등)을 입힌 것입니다.
// "use client": 열고 닫는 상호작용이 있으므로 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react"; // X: 닫기 아이콘
import { cn } from "@/lib/utils";

// 아래 4개는 Radix 원본을 그대로 이름만 바꿔 내보냅니다.
const Dialog = DialogPrimitive.Root; // Root: 다이얼로그 전체를 감싸며 열림/닫힘 상태를 관리
const DialogTrigger = DialogPrimitive.Trigger; // Trigger: 누르면 다이얼로그를 여는 버튼
const DialogPortal = DialogPrimitive.Portal; // Portal: 내용을 body 최상단으로 옮겨 다른 요소에 가리지 않게 함
const DialogClose = DialogPrimitive.Close; // Close: 누르면 다이얼로그를 닫는 요소

// DialogOverlay: 팝업 뒤를 덮는 반투명 검은 배경(딤 처리). data-[state=open] 등은 열림/닫힘 애니메이션용입니다.
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// DialogContent: 실제 팝업 상자(화면 가운데 뜸). 배경(Overlay)을 깔고, 내용과 오른쪽 위 닫기(X) 버튼을 그립니다.
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <X className="h-4 w-4" />
        {/* sr-only: 화면에는 안 보이고 스크린리더(시각장애인용 읽기 프로그램)에게만 읽히는 텍스트 */}
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// DialogHeader: 팝업 위쪽 제목 영역을 담는 컨테이너(단순 div)
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

// DialogFooter: 팝업 아래쪽 버튼 영역(취소/확인 등). 모바일에서는 세로, 넓은 화면에서는 오른쪽 정렬 가로 배치
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// DialogTitle: 팝업 제목 텍스트 (접근성을 위해 다이얼로그에는 제목이 필요)
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// DialogDescription: 제목 아래 설명 문구 (흐린 작은 글씨)
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
