// 짧은 링크를 열 수 없을 때 보여주는 안내 페이지.
// 리다이렉트 라우트(/go/[slug])가 ?reason=notfound|disabled|expired 를 붙여 여기로 보낸다.
// 그 이유(reason)에 맞는 아이콘·제목·설명을 골라 보여준다. 서버 컴포넌트.
import Link from "next/link";
import { AlertTriangle, Ban, Clock, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default function LinkUnavailablePage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const t = getT();
  const reason = searchParams.reason ?? "notfound";
  const reasons: Record<
    string,
    { icon: React.ElementType; title: string; body: string }
  > = {
    notfound: {
      icon: SearchX,
      title: t("misc.linkNotFoundTitle"),
      body: t("misc.linkNotFoundBody"),
    },
    disabled: {
      icon: Ban,
      title: t("misc.linkDisabledTitle"),
      body: t("misc.linkDisabledBody"),
    },
    expired: {
      icon: Clock,
      title: t("misc.linkExpiredTitle"),
      body: t("misc.linkExpiredBody"),
    },
  };
  const info = reasons[reason] ?? {
    icon: AlertTriangle,
    title: t("misc.linkUnavailableTitle"),
    body: t("misc.linkUnavailableBody"),
  };
  const Icon = info.icon;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {info.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{info.body}</p>
          <Button asChild className="mt-6">
            <Link href="/">{t("misc.goToHomepage")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
