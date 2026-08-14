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
import { getDashboardData } from "@/lib/stats";
import { formatNumber, shortUrl } from "@/lib/utils";
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

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const DEVICE_LABELS: Record<string, string> = {
  MOBILE: "Mobile",
  DESKTOP: "Desktop",
  TABLET: "Tablet",
  UNKNOWN: "Unknown",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const { counts } = data;

  if (data.totalLinks === 0) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="An overview of your links and audience."
        />
        <EmptyState
          icon={Link2}
          title="Create your first link"
          description="You haven't created any links yet. Make a trackable short link and your analytics will appear here."
          action={
            <Button asChild>
              <Link href="/dashboard/links/new">
                <Plus />
                Create link
              </Link>
            </Button>
          }
        />
      </>
    );
  }

  const devices = data.devices.map((d) => ({
    label: DEVICE_LABELS[d.label] ?? d.label,
    clicks: d.clicks,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your links and audience."
        actions={
          <Button asChild>
            <Link href="/dashboard/links/new">
              <Plus />
              New link
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total clicks"
          value={formatNumber(counts.totalClicks)}
          icon={MousePointerClick}
          hint={`${formatNumber(counts.humanClicks)} human · ${formatNumber(
            counts.botClicks,
          )} bot`}
        />
        <StatCard
          label="Unique visitors"
          value={formatNumber(counts.uniqueVisitors)}
          icon={Users}
          hint="Estimated"
        />
        <StatCard
          label="Today"
          value={formatNumber(counts.clicksToday)}
          icon={CalendarDays}
        />
        <StatCard label="Last 7 days" value={formatNumber(counts.clicks7d)} />
        <StatCard label="Last 30 days" value={formatNumber(counts.clicks30d)} />
        <StatCard
          label="Active links"
          value={`${formatNumber(data.activeLinks)} / ${formatNumber(
            data.totalLinks,
          )}`}
          icon={Link2}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Unique/returning visitors and bot detection are estimates. CTR is not
        shown because impressions are not measured.
      </p>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clicks — last 30 days</CardTitle>
            <CardDescription>Human clicks per day (UTC).</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/analytics">
              Full analytics
              <ArrowUpRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <TimelineChart data={data.timeline} />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top links</CardTitle>
              <CardDescription>Your most-clicked links.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/links">
                View all
                <ArrowUpRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.topLinks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No clicks recorded yet.
              </p>
            ) : (
              <div className="divide-y">
                {data.topLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Human clicks by device type.</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownList data={devices} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={data.browsers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top countries</CardTitle>
            <CardDescription>From edge geo headers, when available.</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={data.countries}
              emptyMessage="No geo data available"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={data.referrers}
              emptyMessage="No referrer data yet"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-6 p-5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Traffic source</Badge>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Normal links: </span>
                <span className="font-medium tabular-nums">
                  {formatNumber(data.source.link)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">QR scans: </span>
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
