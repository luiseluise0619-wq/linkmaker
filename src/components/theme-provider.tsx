// 앱 전체에 "현재 테마(라이트/다크)"를 공급하는 감싸개(provider).
// next-themes 라이브러리를 그대로 감싼 얇은 래퍼다. 하위의 모든 컴포넌트가
// useTheme()으로 테마를 읽을 수 있게 된다.
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
