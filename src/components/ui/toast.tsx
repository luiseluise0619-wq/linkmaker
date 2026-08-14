"use client";

import * as React from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const toast = React.useCallback(
    (message: string, variant: Toast["variant"] = "default") => {
      const id = ++counter;
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
