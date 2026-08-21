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
export const dynamic = "force-dynamic";

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
  const t = getT();
  const user = await requireUser();
  const range: TimelineRange = RANGES.includes(
    searchParams.range as TimelineRange,
  )
    ? (searchParams.range as TimelineRange)
    : "7d";
  const sort: TopLinkSort = (["clicks", "unique", "recent"] as const).includes(
    searchParams.sort as TopLinkSort,
  )
    ? (searchParams.sort as TopLinkSort)
    : "clicks";

  const data = await getAccountAnalytics(user.id, range, sort);

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

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>{t("dash.clickTimeline")}</CardTitle>
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
            {data.topLinks.map((link, i) => (
              <div
                key={link.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
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
