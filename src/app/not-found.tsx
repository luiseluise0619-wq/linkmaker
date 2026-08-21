// 존재하지 않는 주소로 들어왔을 때 자동으로 보여주는 404 페이지(Next.js 규칙 파일).
// 서버 컴포넌트: 현재 언어에 맞는 안내 문구를 보여주고 홈으로 가는 버튼을 준다.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { getT } from "@/lib/i18n/server";

export default function NotFound() {
  const t = getT();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-20">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {t("misc.notFoundTitle")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("misc.notFoundBody")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/">{t("misc.backToHomepage")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
