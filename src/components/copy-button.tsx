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
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
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
