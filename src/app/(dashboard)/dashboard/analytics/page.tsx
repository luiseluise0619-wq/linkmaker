import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
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
const RANGE_LABELS: Record<TimelineRange, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string; sort?: string };
}) {
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
        <PageHeader title="Analytics" description="Traffic across all links." />
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Create links and share them — click data will show up here."
          action={
            <Link
              href="/dashboard/links/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              Create your first link →
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
        title="Analytics"
        description="Aggregated traffic across all of your links."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/api/export/links" download>
                <Download />
                Links CSV
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export/events" download>
                <Download />
                Events CSV
              </a>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total clicks"
          value={formatNumber(counts.totalClicks)}
          hint={`${formatNumber(counts.humanClicks)} human · ${formatNumber(
            counts.botClicks,
          )} bot (est.)`}
        />
        <StatCard
          label="Unique visitors"
          value={formatNumber(counts.uniqueVisitors)}
          hint="Estimated"
        />
        <StatCard
          label="Returning"
          value={formatNumber(counts.returningVisitors)}
          hint="Estimated"
        />
        <StatCard
          label="Last 30 days"
          value={formatNumber(counts.clicks30d)}
        />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Click timeline</CardTitle>
          <ParamTabs
            param="range"
            defaultValue="7d"
            options={RANGES.map((r) => ({ value: r, label: RANGE_LABELS[r] }))}
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
            referrers: data.referrers,
            utm: data.utm,
            source: data.source,
          }}
        />
      </div>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Top links</CardTitle>
          <ParamTabs
            param="sort"
            defaultValue="clicks"
            options={[
              { value: "clicks", label: "Clicks" },
              { value: "unique", label: "Unique" },
              { value: "recent", label: "Recent" },
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
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium tabular-nums">
                      {formatNumber(link.uniqueVisitors)}
                    </p>
                    <p className="text-xs text-muted-foreground">unique</p>
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
