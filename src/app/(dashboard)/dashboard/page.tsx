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

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const DEVICE_LABEL_KEYS: Record<string, string> = {
  MOBILE: "dash.deviceMobile",
  DESKTOP: "dash.deviceDesktop",
  TABLET: "dash.deviceTablet",
  UNKNOWN: "dash.deviceUnknown",
};

export default async function DashboardPage() {
  const t = getT();
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const { counts } = data;

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
          <TimelineChart data={data.timeline} />
        </CardContent>
      </Card>

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
            <BreakdownList data={devices} />
          </CardContent>
        </Card>
      </div>

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
