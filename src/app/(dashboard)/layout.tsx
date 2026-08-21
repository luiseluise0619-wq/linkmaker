// ============================================================================
// 파일 목적: 대시보드 영역 전체를 감싸는 공통 레이아웃(Layout)입니다.
//   - (dashboard) 폴더 안의 모든 페이지는 이 레이아웃 안쪽(children)에 표시됩니다.
//   - 왼쪽 사이드바 + 상단 헤더처럼 "매 페이지마다 반복되는 뼈대"를 여기서 한 번만 정의합니다.
//   - 이 파일은 Server Component 입니다. (파일 맨 위에 "use client" 가 없고,
//     함수가 async 라서 서버에서 실행되며 await 로 DB/세션을 직접 조회할 수 있습니다.)
// ============================================================================
import Link from "next/link";
import { Plus } from "lucide-react";
import { getDashboardToken, requireUser } from "@/lib/auth";
import { dashboardUrl } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { getT } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardLinkBar } from "@/components/dashboard/dashboard-link-bar";

// children: 이 레이아웃 안에 들어갈 실제 페이지 내용(예: 대시보드/링크/설정 페이지)
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireUser(): 로그인(세션) 확인용 함수. 세션이 없으면 내부에서 "/" 로 돌려보냅니다.
  //   -> 즉, 이 레이아웃을 쓰는 모든 대시보드 페이지가 자동으로 보호됩니다.
  const user = await requireUser();
  // 이 사용자의 대시보드 접속용 비밀 토큰을 가져옵니다. (아래 헤더/링크바에서 공유 URL로 사용)
  const token = await getDashboardToken(user.id);
  // getT(): 현재 언어(한국어/영어 등)에 맞는 번역 함수 t 를 돌려줍니다.
  //   -> t("어떤.키") 는 현재 언어에 맞는 문장을 반환합니다. (i18n = 다국어 처리)
  const t = getT();

  return (
    <div className="min-h-screen">
      {/* 사이드바(왼쪽 세로 메뉴) - 데스크톱 화면에서만 보입니다.
          hidden ... md:flex : 작은(모바일) 화면에서는 숨기고, 중간 화면 이상에서만 표시 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo href="/dashboard" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <DashboardNav />
        </div>
        <div className="border-t p-3">
          {/* 사이드바 맨 아래 "새 링크 만들기" 버튼 -> /dashboard/links/new 페이지로 이동 */}
          <Button asChild className="w-full">
            <Link href="/dashboard/links/new">
              <Plus />
              {t("nav.newLink")}
            </Link>
          </Button>
        </div>
      </aside>

      {/* 메인 영역(오른쪽). md:pl-60 : 데스크톱에서는 사이드바 너비(60)만큼 왼쪽 여백을 줘 겹치지 않게 함 */}
      <div className="flex min-h-screen flex-col md:pl-60">
        {/* 상단 헤더(항상 위에 고정). sticky top-0 : 스크롤해도 화면 맨 위에 붙어 있음 */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2">
            <MobileNav />
            <span className="text-sm font-medium text-muted-foreground md:hidden">
              LinkMaker
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* 언어 전환 / 다크·라이트 테마 전환 / 사용자 메뉴 버튼들 */}
            <LanguageToggle />
            <ThemeToggle />
            {/* dashboardUrl(token): 이 사용자의 대시보드 접속 전용 URL을 만들어 전달 */}
            <UserMenu dashboardHref={dashboardUrl(token)} />
          </div>
        </header>
        {/* 헤더 아래에 대시보드 공유 링크를 안내하는 막대(bar) */}
        <DashboardLinkBar url={dashboardUrl(token)} />
        {/* 실제 페이지 내용이 이 자리(children)에 렌더링됩니다. */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
