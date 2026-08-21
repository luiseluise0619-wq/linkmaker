import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { getOwnedLinkBySlug } from "@/lib/links";
import { getLinkAnalytics } from "@/lib/stats";
import { formatDateTime, formatNumber, shortUrl } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsSections } from "@/components/dashboard/analytics-sections";
import { EmbedSnippets } from "@/components/dashboard/embed-snippets";
import { TimelineChart } from "@/components/charts/timeline-chart";
import { CopyButton } from "@/components/copy-button";
import { QrDialog } from "@/components/qr-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Link analytics" };
export const dynamic = "force-dynamic";

// 링크 한 개의 상세/분석 페이지. 서버 컴포넌트(async): 내 소유 링크를 찾고(없으면 404),
// 그 링크의 통계(getLinkAnalytics)를 계산해 KPI 카드·추이 그래프·분류 섹션으로 보여준다.
export default async function LinkDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireUser();
  const t = getT();
  const link = await getOwnedLinkBySlug(user.id, params.slug);
  if (!link) notFound();

  const analytics = await getLinkAnalytics(link.id);
  const { counts } = analytics;
  const url = shortUrl(link.slug);
  const expired = link.expiresAt && link.expiresAt.getTime() <= Date.now();
  const statusBadge = expired
    ? { label: t("links.statusExpired"), variant: "warning" as const }
    : link.status === "DISABLED"
      ? { label: t("links.statusDisabled"), variant: "secondary" as const }
      : { label: t("links.statusActive"), variant: "success" as const };

  return (
    <>
      <PageHeader
        title={link.title || `/go/${link.slug}`}
        description={t("links.detailDescription")}
        actions={
          <>
            <QrDialog linkId={link.id} shortUrl={url} />
            <Button asChild variant="outline">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                {t("links.open")}
              </a>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/links/${link.slug}/edit`}>
                <Pencil />
                {t("links.edit")}
              </Link>
            </Button>
          </>
        }
      />

      {/* Meta card */}
      <Card className="mb-6">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label={t("links.metaShortUrl")}>
            <div className="flex items-center gap-1">
              <code className="truncate text-sm">{url}</code>
              <CopyButton value={url} size="icon" className="h-7 w-7" />
            </div>
          </Meta>
          <Meta label={t("links.metaDestination")}>
            <a
              href={link.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-primary hover:underline"
              title={link.destinationUrl}
            >
              {link.destinationUrl}
            </a>
          </Meta>
          <Meta label={t("links.metaStatus")}>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </Meta>
          <Meta label={t("links.metaCreated")}>
            <span className="text-sm">{formatDateTime(link.createdAt)}</span>
          </Meta>
          <Meta label={t("links.metaLastClick")}>
            <span className="text-sm">
              {counts.lastClick ? formatDateTime(counts.lastClick) : "—"}
            </span>
          </Meta>
          {link.expiresAt && (
            <Meta label={t("links.metaExpires")}>
              <span className="text-sm">{formatDateTime(link.expiresAt)}</span>
            </Meta>
          )}
          {link.campaign && (
            <Meta label={t("links.metaCampaign")}>
              <span className="text-sm">{link.campaign.name}</span>
            </Meta>
          )}
          <Meta label={t("links.metaTrafficSource")}>
            <span className="text-sm">
              {t("links.trafficSourceValue", {
                link: formatNumber(analytics.source.link),
                qr: formatNumber(analytics.source.qr),
              })}
            </span>
          </Meta>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={t("links.kpiTotalClicks")}
          value={formatNumber(counts.totalClicks)}
          hint={t("links.kpiClicksHint", {
            human: formatNumber(counts.humanClicks),
            bot: formatNumber(counts.botClicks),
          })}
        />
        <StatCard
          label={t("links.kpiUniqueVisitors")}
          value={formatNumber(counts.uniqueVisitors)}
          hint={t("links.kpiEstimated")}
        />
        <StatCard
          label={t("links.kpiReturning")}
          value={formatNumber(counts.returningVisitors)}
          hint={t("links.kpiEstimated")}
        />
        <StatCard
          label={t("links.kpiToday")}
          value={formatNumber(counts.clicksToday)}
        />
        <StatCard
          label={t("links.kpiThisWeek")}
          value={formatNumber(counts.clicks7d)}
        />
        <StatCard
          label={t("links.kpiThisMonth")}
          value={formatNumber(counts.clicks30d)}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("links.estimatesNote")}
      </p>

      {/* Timeline */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("links.timelineTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart data={analytics.timeline7d} />
        </CardContent>
      </Card>

      {/* Breakdown grid + hour/weekday */}
      <div className="mt-4">
        <AnalyticsSections analytics={analytics} />
      </div>

      {/* Image embed */}
      {link.image && (
        <div className="mt-6">
          <EmbedSnippets
            shortUrl={url}
            imageUrl={link.image.url}
            alt={link.image.alt || link.title || t("links.campaignImageAlt")}
          />
        </div>
      )}
    </>
  );
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
