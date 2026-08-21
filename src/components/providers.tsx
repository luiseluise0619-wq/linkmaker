// 앱 전체를 감싸는 "공급자(provider)" 묶음. 여기서 감싼 값들은 아래의 모든 컴포넌트가
// 꺼내 쓸 수 있다: 테마(라이트/다크), 언어(한/영), 토스트 알림.
// 루트 레이아웃(src/app/layout.tsx)이 서버에서 언어·사전을 정해 이 컴포넌트에 넘겨준다.
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
