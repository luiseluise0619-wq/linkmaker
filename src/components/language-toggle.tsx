"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setLocaleCookie, useLocale } from "@/lib/i18n/client";

/**
 * Switch between Korean and English. The choice is stored in a cookie the
 * server reads on the next render; router.refresh() re-renders the server
 * components in the newly chosen language.
 */
export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const next = locale === "ko" ? "en" : "ko";
  const label = locale === "ko" ? "한국어" : "EN";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 px-2"
      aria-label={locale === "ko" ? "Switch to English" : "한국어로 전환"}
      onClick={() => {
        setLocaleCookie(next);
        router.refresh();
      }}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}
