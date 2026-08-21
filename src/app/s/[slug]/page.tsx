// 공개 통계 페이지(/s/슬러그?t=토큰). 로그인 없이도 "올바른 토큰(t)"만 있으면 그 링크의
// 통계를 볼 수 있게 하는 공유용 페이지. 익명으로 링크를 만든 사람이 통계 링크를 공유할 때 사용.
// 서버 컴포넌트: 토큰을 검증(getPublicLinkByToken)해 맞을 때만 통계를 보여준다.
// metadata의 robots: index:false → 검색엔진에 노출되지 않게 한다.
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Lock } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { getPublicLinkByToken } from "@/lib/links";
import { getLinkAnalytics } from "@/lib/stats";
import { formatDateTime, formatNumber, shortUrl } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsSections } from "@/components/dashboard/analytics-sections";
import { TimelineChart } from "@/components/charts/timeline-chart";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Link analytics",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}

export default async function PublicStatsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { t?: string };
}) {
  const t = getT();
  const token = searchParams.t ?? "";
  const link = await getPublicLinkByToken(params.slug, token);

  if (!link) {
    return (
      <Shell>
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {t("misc.statsNotAvailableTitle")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("misc.statsNotAvailableBody")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/">{t("misc.goToHomepage")}</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const analytics = await getLinkAnalytics(link.id);
  const { counts } = analytics;
  const url = shortUrl(link.slug);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {link.title || `/go/${link.slug}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("misc.publicStatsSubtitle")}
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("misc.shortUrl")}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <code className="truncate text-sm">{url}</code>
              <CopyButton value={url} size="icon" className="h-7 w-7" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("misc.destination")}
            </p>
            <a
              href={link.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-sm text-primary hover:underline"
            >
              {link.destinationUrl}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("misc.created")}
            </p>
            <p className="mt-1 text-sm">{formatDateTime(link.createdAt)}</p>
          </div>
          <div className="flex items-end">
            <Button asChild variant="outline" size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                {t("misc.openLink")}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("misc.totalClicks")}
          value={formatNumber(counts.totalClicks)}
          hint={t("misc.statHintHumanBot", {
            human: formatNumber(counts.humanClicks),
            bot: formatNumber(counts.botClicks),
          })}
        />
        <StatCard
          label={t("misc.uniqueVisitors")}
          value={formatNumber(counts.uniqueVisitors)}
          hint={t("misc.estimated")}
        />
        <StatCard label={t("misc.today")} value={formatNumber(counts.clicksToday)} />
        <StatCard label={t("misc.last7Days")} value={formatNumber(counts.clicks7d)} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("misc.clicksLast7Days")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart data={analytics.timeline7d} />
        </CardContent>
      </Card>

      <div className="mt-4">
        <AnalyticsSections analytics={analytics} />
      </div>

      <div className="mt-8 rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        {t("misc.ctaCreateOwn")}
        <Link href="/" className="font-medium text-foreground hover:underline">
          {t("misc.ctaMakeFree")}
        </Link>
        .
      </div>
    </Shell>
  );
}
