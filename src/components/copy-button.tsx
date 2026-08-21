// 클릭하면 주어진 값을 클립보드에 복사하는 버튼. 복사 후 1.5초간 체크(✓) 표시.
// 클라이언트 컴포넌트: navigator.clipboard(브라우저 기능)와 상태(copied)를 쓴다.
"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "value"> {
  value: string;
  label?: string;
}

export function CopyButton({
  value,
  label,
  className,
  variant = "outline",
  size = label ? "sm" : "icon",
  ...props
}: CopyButtonProps) {
  const t = useT();
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value); // 클립보드에 복사
      setCopied(true); // 방금 복사됨 표시
      setTimeout(() => setCopied(false), 1500); // 1.5초 뒤 원래대로
    } catch {
      /* 일부 환경(비보안 컨텍스트 등)에선 클립보드를 못 쓸 수 있어 무시 */
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={copy}
      aria-label={label ? undefined : t("misc.copy")}
      {...props}
    >
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
      {label ? <span>{copied ? t("misc.copied") : label}</span> : null}
    </Button>
  );
}
