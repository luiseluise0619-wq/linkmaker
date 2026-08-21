// ============================================================================
// 파일 목적: "마케팅" 영역(랜딩, 개인정보, 방법론 페이지 등)의 공통 레이아웃입니다.
// 폴더 이름 (marketing) 처럼 괄호로 감싼 폴더는 "라우트 그룹"(route group)이라 부르며,
// URL 경로에는 나타나지 않고 파일을 묶어 공통 레이아웃을 씌우는 용도로만 씁니다.
// 즉 이 파일은 상단 헤더 + 하단 푸터를 공통으로 그려주고, 가운데 children에
// 각 페이지 내용을 끼워 넣습니다.
//
// 이 파일은 "서버 컴포넌트"이자 async 함수입니다. 서버 컴포넌트는 await로 DB/세션을
// 직접 기다릴 수 있어, 렌더링 전에 필요한 데이터를 미리 가져올 수 있습니다.
// ============================================================================
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { warmDb } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fire-and-forget: kick off a DB wake-up on site entry (the connection
  // attempt starts the wake) WITHOUT blocking the landing page render on a
  // cold/suspended database. warmDb swallows its own errors.
  void warmDb();
  // 로그인한 사용자가 있으면 그 정보를, 없으면 null을 받습니다. 이 앱은 로그인 없이도
  // 쓸 수 있으므로 대부분 방문자는 null입니다.
  const user = await getSessionUser();
  // t는 번역 함수입니다. t("키")를 부르면 현재 언어에 맞는 문구를 돌려줍니다.
  // (번역 값은 건드리지 않습니다.)
  const t = getT();
  return (
    // 화면 전체 세로 배치: 헤더 - 본문(main, flex-1로 남은 공간 채움) - 푸터 순서
    <div className="flex min-h-screen flex-col">
      {/* 상단 헤더: sticky top-0 이라서 스크롤해도 화면 맨 위에 고정됩니다 */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          {/* 데스크톱 전용 내비게이션(md:flex). 좁은 화면에서는 hidden으로 숨겨집니다.
              href="/#features" 처럼 #이 붙으면 같은 페이지 내 해당 섹션으로 스크롤 이동 */}
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#features" className="hover:text-foreground">
              {t("landing.navFeatures")}
            </Link>
            <Link href="/#analytics" className="hover:text-foreground">
              {t("landing.navAnalytics")}
            </Link>
            <Link href="/#privacy" className="hover:text-foreground">
              {t("landing.navPrivacy")}
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              {t("landing.navPrivacyPolicy")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {/* 언어 전환 / 다크·라이트 테마 전환 버튼 (둘 다 클라이언트 컴포넌트) */}
            <LanguageToggle />
            <ThemeToggle />
            {/* 삼항 연산자(조건 ? A : B): 로그인 상태면 "대시보드" 버튼을,
                아니면 "링크 만들기" 버튼을 보여줍니다.
                asChild: Button의 모양만 빌려 실제 태그는 안의 <Link>가 되게 합니다. */}
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">{t("landing.navDashboard")}</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/#create">{t("landing.navCreateLink")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* 본문: 각 페이지의 실제 내용(children)이 여기에 들어옵니다 */}
      <main className="flex-1">{children}</main>
      {/* 하단 푸터: 로고, 저작권(연도를 t()에 변수로 전달), 안내 링크들 */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>
            {t("landing.footerCopyright", {
              year: new Date().getFullYear(),
            })}
          </p>
          <div className="flex gap-4">
            <Link href="/methodology" className="hover:text-foreground">
              {t("landing.footerHowItWorks")}
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              {t("landing.footerPrivacy")}
            </Link>
            <Link href="/#create" className="hover:text-foreground">
              {t("landing.footerCreateLink")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
