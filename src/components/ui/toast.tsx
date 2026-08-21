// 토스트(toast) = 화면 오른쪽 아래에 잠깐 떴다 사라지는 알림 메시지.
// 어디서든 useToast().toast("저장됨", "success") 처럼 호출하면 알림이 뜬다.
// ToastProvider가 앱을 감싸 알림 목록을 관리하고, 각 알림은 3.5초 뒤 자동으로 사라진다.
// (Context로 어디서나 toast 함수를 꺼내 쓸 수 있게 공급한다.)
"use client";

import * as React from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 알림 하나: 고유 id, 보여줄 문구, 종류(기본/성공/오류).
interface Toast {
  id: number;
  message: string;
  variant: "default" | "success" | "error";
}

interface ToastContextValue {
  toast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  // 새 알림을 목록에 추가하고, 3.5초 뒤 그 알림만 목록에서 제거(자동 사라짐).
  const toast = React.useCallback(
    (message: string, variant: Toast["variant"] = "default") => {
      const id = ++counter; // 알림마다 고유 번호 부여
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 3500);
    },
    [],
  );

  const dismiss = (id: number) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-background p-3 shadow-lg",
              t.variant === "error" && "border-destructive/40",
              t.variant === "success" && "border-emerald-500/40",
            )}
          >
            {t.variant === "success" && (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            )}
            {t.variant === "error" && (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            )}
            <p className="flex-1 text-sm">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
