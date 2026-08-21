// 라이트/다크 화면 모드를 켜고 끄는 버튼(해/달 아이콘).
// 클라이언트 컴포넌트: 현재 테마를 읽고 바꾸는 건 브라우저에서만 가능.
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"; // 테마 상태를 다루는 라이브러리
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  // mounted 트릭: 서버가 그린 첫 화면과 브라우저가 아는 실제 테마가 다를 수 있어,
  // 브라우저에 붙은(mounted) 뒤에만 실제 아이콘을 보여줘 깜빡임/불일치를 막는다.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
