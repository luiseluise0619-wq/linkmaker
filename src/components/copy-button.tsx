"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      aria-label={label ? undefined : "Copy"}
      {...props}
    >
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </Button>
  );
}
