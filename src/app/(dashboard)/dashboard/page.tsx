// ============================================================================
// 파일 목적: 대시보드 첫 화면(/dashboard)입니다. 로그인 후 처음 보게 되는 요약 페이지.
//   - 전체 클릭 수, 방문자 수, 최근 30일 추이 그래프, 인기 링크, 기기/브라우저/국가별
//     통계 등을 카드 형태로 보여줍니다.
//   - 이 파일은 Server Component 입니다. (async 함수라서 서버에서 실행되고,
//     await 로 DB에서 통계를 직접 가져와 완성된 HTML을 사용자에게 보냅니다.)
// ============================================================================
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  CalendarDays,
  Link2,
  MousePointerClick,
  Plus,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { getDashboardData } from "@/lib/stats";
import { DISPLAY_TZ, formatNumber, shortUrl } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreakdownList } from "@/components/charts/breakdown-list";
import { TimelineChart } from "@/components/charts/timeline-chart";
import { EmptyState } from "@/components/dashboard/empty-state";

// metadata: 브라우저 탭에 표시되는 페이지 제목 등 Next.js가 읽는 정보
export const metadata: Metadata = { title: "Dashboard" };
// dynamic = "force-dynamic": 이 페이지를 미리 만들어 캐시하지 말고,
//   방문할 때마다 매번 서버에서 최신 데이터로 새로 그리라는 Next.js 설정입니다.
export const dynamic = "force-dynamic";

// DB에 저장된 기기 종류 값(MOBILE 등)을 번역 키로 바꿔주는 표(매핑).
const DEVICE_LABEL_KEYS: Record<string, string> = {
  MOBILE: "dash.deviceMobile",
  DESKTOP: "dash.deviceDesktop",
  TABLET: "dash.deviceTablet",
  UNKNOWN: "dash.deviceUnknown",
};

export default async function DashboardPage() {
  const t = getT(); // 현재 언어의 번역 함수
  const user = await requireUser(); // 로그인 확인 (세션 없으면 "/" 로 이동)
  // getDashboardData(): src/lib/stats.ts 안의 도우미 함수. DB를 조회해
  //   대시보드에 필요한 모든 통계를 한 번에 계산해서 돌려줍니다. (await로 결과 기다림)
  const data = await getDashboardData(user.id);
  const { counts } = data; // data 안의 counts(각종 합계)를 편하게 쓰려고 따로 꺼냄

  // 아직 만든 링크가 하나도 없으면, 통계 대신 "첫 링크를 만드세요" 안내 화면을 보여줍니다.
  if (data.totalLinks === 0) {
    return (
      <>
        <PageHeader
          title={t("dash.pageTitle")}
          description={t("dash.pageDescription")}
        />
        <EmptyState
          icon={Link2}
          title={t("dash.emptyTitle")}
          description={t("dash.emptyDescription")}
          action={
            <Button asChild>
              <Link href="/dashboard/links/new">
                <Plus />
                {t("dash.createLink")}
              </Link>
            </Button>
          }
        />
      </>
    );
  }

  // 기기별 통계의 라벨(MOBILE 등)을 현재 언어 문구로 번역해 새 목록을 만듭니다.
  //   DEVICE_LABEL_KEYS 에 없는 값이면(?? d.label) 원래 값을 그대로 사용합니다.
  const devices = data.devices.map((d) => ({
    label: t(DEVICE_LABEL_KEYS[d.label] ?? d.label),
    clicks: d.clicks,
  }));

  return (
    <>
      <PageHeader
        title={t("dash.pageTitle")}
        description={t("dash.pageDescription")}
        actions={
          <Button asChild>
            <Link href="/dashboard/links/new">
              <Plus />
              {t("dash.newLink")}
            </Link>
          </Button>
        }
      />

      {/* 상단 요약 통계 카드들(6개). 화면 크기에 따라 2~6칸 격자로 배치됩니다.
          StatCard: 숫자 하나를 라벨/아이콘과 함께 예쁘게 보여주는 재사용 카드 컴포넌트 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={t("dash.totalClicks")}
          value={formatNumber(counts.totalClicks)}
          icon={MousePointerClick}
          hint={t("dash.clicksHumanBotHint", {
            human: formatNumber(counts.humanClicks),
            bot: formatNumber(counts.botClicks),
          })}
        />
        <StatCard
          label={t("dash.uniqueVisitors")}
          value={formatNumber(counts.uniqueVisitors)}
          icon={Users}
          hint={t("dash.estimated")}
        />
        <StatCard
          label={t("dash.today")}
          value={formatNumber(counts.clicksToday)}
          icon={CalendarDays}
        />
        <StatCard label={t("dash.last7Days")} value={formatNumber(counts.clicks7d)} />
        <StatCard label={t("dash.last30Days")} value={formatNumber(counts.clicks30d)} />
        <StatCard
          label={t("dash.activeLinks")}
          value={`${formatNumber(data.activeLinks)} / ${formatNumber(
            data.totalLinks,
          )}`}
          icon={Link2}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {t("dash.estimatesNote")}
      </p>

      {/* 최근 30일 클릭 추이 그래프 카드. 오른쪽 위 버튼으로 상세 분석 페이지로 이동 */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("dash.clicksLast30DaysTitle")}</CardTitle>
            <CardDescription>
              {t("dash.humanClicksPerDay", { tz: DISPLAY_TZ })}
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/analytics">
              {t("dash.fullAnalytics")}
              <ArrowUpRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* TimelineChart: 날짜별 클릭 수를 선/막대 그래프로 그려주는 컴포넌트 */}
          <TimelineChart data={data.timeline} />
        </CardContent>
      </Card>

      {/* 아래 격자: 왼쪽 넓은 칸에 "인기 링크", 오른쪽 칸에 "기기별" 통계 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dash.topLinks")}</CardTitle>
              <CardDescription>{t("dash.topLinksDescription")}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/links">
                {t("dash.viewAll")}
                <ArrowUpRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {/* 인기 링크가 없으면 안내 문구, 있으면 목록을 하나씩(map) 그립니다. */}
            {data.topLinks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("dash.noClicksYet")}
              </p>
            ) : (
              <div className="divide-y">
                {data.topLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      {/* 링크 상세 페이지로 이동. slug(짧은 주소 조각)를 URL에 끼워 넣음.
                          제목이 없으면(||) 대신 "/go/슬러그"를 보여줍니다. */}
                      <Link
                        href={`/dashboard/links/${link.slug}`}
                        className="truncate font-medium hover:underline"
                      >
                        {link.title || `/go/${link.slug}`}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {shortUrl(link.slug)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-right text-sm">
                      <div>
                        <p className="font-medium tabular-nums">
                          {formatNumber(link.clicks)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("dash.clicksLabel")}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-medium tabular-nums">
                          {formatNumber(link.uniqueVisitors)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("dash.uniqueLabel")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dash.devices")}</CardTitle>
            <CardDescription>{t("dash.devicesDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* BreakdownList: 항목별 비율을 막대와 함께 목록으로 보여주는 컴포넌트 */}
            <BreakdownList data={devices} />
          </CardContent>
        </Card>
      </div>

      {/* 브라우저 / 국가 / 유입경로(referrer)별 통계를 3칸으로 나눠 표시 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.topBrowsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={data.browsers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.topCountries")}</CardTitle>
            <CardDescription>{t("dash.countriesDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={data.countries}
              emptyMessage={t("dash.noGeoData")}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.topReferrers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={data.referrers}
              emptyMessage={t("dash.noReferrerData")}
            />
          </CardContent>
        </Card>
      </div>

      {/* 트래픽 유입 방식 요약: 일반 링크 클릭 수 vs QR 코드 스캔 수 */}
      <div className="mt-4">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-6 p-5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t("dash.trafficSource")}</Badge>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">{t("dash.normalLinks")}: </span>
                <span className="font-medium tabular-nums">
                  {formatNumber(data.source.link)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("dash.qrScans")}: </span>
                <span className="font-medium tabular-nums">
                  {formatNumber(data.source.qr)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
