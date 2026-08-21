"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";

export function Providers({
  children,
  locale,
  dict,
  fallback,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: Record<string, string>;
  fallback: Record<string, string>;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider locale={locale} dict={dict} fallback={fallback}>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
