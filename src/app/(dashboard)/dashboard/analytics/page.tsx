// ============================================================================
// 파일 목적: 계정 전체의 상세 분석(Analytics) 페이지(/dashboard/analytics)입니다.
//   - 기간(24시간/7일/30일/90일)과 정렬 기준을 골라 클릭 추이·기기·국가·유입경로 등
//     대시보드보다 더 자세한 통계를 보여주고, CSV 내보내기 버튼도 제공합니다.
//   - Server Component 입니다. (async 함수 -> 서버에서 실행, await로 DB 통계 조회)
//   - searchParams: 현재 URL의 물음표 뒤 값(예: ?range=30d&sort=unique)을 담은 객체입니다.
//     사용자가 탭을 누르면 URL이 바뀌고, 그 값을 여기서 읽어 어떤 데이터를 보여줄지 정합니다.
// ============================================================================
import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import {
  getAccountAnalytics,
  type TimelineRange,
  type TopLinkSort,
} from "@/lib/stats";
import { formatNumber, shortUrl } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsSections } from "@/components/dashboard/analytics-sections";
import { ParamTabs } from "@/components/dashboard/param-tabs";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TimelineChart } from "@/components/charts/timeline-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Analytics" };
// 방문할 때마다 최신 데이터로 매번 새로 그리라는 설정(캐시하지 않음)
export const dynamic = "force-dynamic";

// 선택 가능한 기간 목록. 사용자가 고른 값이 이 안에 있는지 검사할 때 씁니다.
const RANGES: TimelineRange[] = ["24h", "7d", "30d", "90d"];
const RANGE_LABEL_KEYS: Record<TimelineRange, string> = {
  "24h": "dash.range24h",
  "7d": "dash.range7d",
  "30d": "dash.range30d",
  "90d": "dash.range90d",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string; sort?: string };
}) {
  const t = getT(); // 현재 언어의 번역 함수
  const user = await requireUser(); // 로그인 확인
  // URL의 range 값이 허용된 목록(RANGES)에 있으면 그 값을, 아니면 기본값 "7d"를 사용.
  //   (사용자가 주소창을 조작해 이상한 값을 넣어도 안전하게 처리하는 방어 코드)
  const range: TimelineRange = RANGES.includes(
    searchParams.range as TimelineRange,
  )
    ? (searchParams.range as TimelineRange)
    : "7d";
  // 정렬 기준도 같은 방식으로 검사. 허용된 값(clicks/unique/recent)이 아니면 "clicks".
  const sort: TopLinkSort = (["clicks", "unique", "recent"] as const).includes(
    searchParams.sort as TopLinkSort,
  )
    ? (searchParams.sort as TopLinkSort)
    : "clicks";

  // 고른 기간·정렬 기준에 맞춰 DB에서 계정 전체 통계를 계산해 가져옵니다.
  const data = await getAccountAnalytics(user.id, range, sort);

  // 링크가 하나도 없으면 통계 대신 "첫 링크를 만드세요" 안내 화면을 보여줍니다.
  if (!data.hasLinks) {
    return (
      <>
        <PageHeader
          title={t("dash.analyticsTitle")}
          description={t("dash.analyticsDescriptionEmpty")}
        />
        <EmptyState
          icon={BarChart3}
          title={t("dash.noAnalyticsTitle")}
          description={t("dash.noAnalyticsDescription")}
          action={
            <Link
              href="/dashboard/links/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("dash.createFirstLink")} →
            </Link>
          }
        />
      </>
    );
  }

  const { counts } = data;

  return (
    <>
      <PageHeader
        title={t("dash.analyticsTitle")}
        description={t("dash.analyticsDescription")}
        actions={
          // 페이지 오른쪽 위 액션 버튼들: 링크/이벤트 데이터를 CSV 파일로 내려받기.
          //   download 속성이 있어 클릭 시 파일 다운로드가 시작됩니다.
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/api/export/links" download>
                <Download />
                {t("dash.linksCsv")}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export/events" download>
                <Download />
                {t("dash.eventsCsv")}
              </a>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dash.totalClicks")}
          value={formatNumber(counts.totalClicks)}
          hint={t("dash.clicksHumanBotEstHint", {
            human: formatNumber(counts.humanClicks),
            bot: formatNumber(counts.botClicks),
          })}
        />
        <StatCard
          label={t("dash.uniqueVisitors")}
          value={formatNumber(counts.uniqueVisitors)}
          hint={t("dash.estimated")}
        />
        <StatCard
          label={t("dash.returning")}
          value={formatNumber(counts.returningVisitors)}
          hint={t("dash.estimated")}
        />
        <StatCard
          label={t("dash.last30Days")}
          value={formatNumber(counts.clicks30d)}
        />
      </div>

      {/* 클릭 추이 그래프 카드. 오른쪽 위 탭으로 기간을 바꿉니다. */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>{t("dash.clickTimeline")}</CardTitle>
          {/* ParamTabs: 탭을 누르면 URL의 range 값을 바꿔주는 컴포넌트.
              URL이 바뀌면 이 서버 컴포넌트가 새 값으로 다시 실행되어 그래프가 갱신됩니다. */}
          <ParamTabs
            param="range"
            defaultValue="7d"
            options={RANGES.map((r) => ({
              value: r,
              label: t(RANGE_LABEL_KEYS[r]),
            }))}
          />
        </CardHeader>
        <CardContent>
          <TimelineChart data={data.timeline} />
        </CardContent>
      </Card>

      {/* AnalyticsSections: 시간대별/요일별/기기/브라우저/국가/유입경로 등 여러 통계 묶음을
          한꺼번에 그려주는 컴포넌트. 아래처럼 필요한 데이터를 하나의 객체로 묶어 넘겨줍니다. */}
      <div className="mt-4">
        <AnalyticsSections
          analytics={{
            counts: data.counts,
            timeline7d: data.timeline,
            byHour: data.byHour,
            byWeekday: data.byWeekday,
            devices: data.devices,
            browsers: data.browsers,
            os: data.os,
            countries: data.countries,
            cities: data.cities,
            referrers: data.referrers,
            utm: data.utm,
            utmSources: data.utmSources,
            utmMediums: data.utmMediums,
            source: data.source,
          }}
        />
      </div>

      {/* 인기 링크 순위 카드. 오른쪽 위 탭으로 정렬 기준(클릭/순방문/최근)을 바꿉니다. */}
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>{t("dash.topLinks")}</CardTitle>
          <ParamTabs
            param="sort"
            defaultValue="clicks"
            options={[
              { value: "clicks", label: t("dash.sortClicks") },
              { value: "unique", label: t("dash.sortUnique") },
              { value: "recent", label: t("dash.sortRecent") },
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {/* 인기 링크 목록을 하나씩 그립니다. i는 0부터 시작하는 순번(index). */}
            {data.topLinks.map((link, i) => (
              <div
                key={link.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* 사람이 보는 순위는 1부터 시작하므로 i + 1 로 표시 */}
                  <span className="w-5 shrink-0 text-sm text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/links/${link.slug}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {link.title || `/go/${link.slug}`}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      {shortUrl(link.slug)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-6 text-right text-sm">
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
        </CardContent>
      </Card>
    </>
  );
}
