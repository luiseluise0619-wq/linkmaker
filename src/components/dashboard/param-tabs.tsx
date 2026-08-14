"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

export function ParamTabs({
  param,
  options,
  defaultValue,
}: {
  param: string;
  options: Option[];
  defaultValue: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get(param) ?? defaultValue;

  function select(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value === defaultValue) sp.delete(param);
    else sp.set(param, value);
    router.push(`?${sp.toString()}`, { scroll: false });
  }

  return (
    <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => select(opt.value)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            current === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
