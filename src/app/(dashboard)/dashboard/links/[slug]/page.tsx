import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
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

export default async function LinkDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireUser();
  const link = await getOwnedLinkBySlug(user.id, params.slug);
  if (!link) notFound();

  const analytics = await getLinkAnalytics(link.id);
  const { counts } = analytics;
  const url = shortUrl(link.slug);
  const expired = link.expiresAt && link.expiresAt.getTime() <= Date.now();
  const statusBadge = expired
    ? { label: "Expired", variant: "warning" as const }
    : link.status === "DISABLED"
      ? { label: "Disabled", variant: "secondary" as const }
      : { label: "Active", variant: "success" as const };

  return (
    <>
      <PageHeader
        title={link.title || `/go/${link.slug}`}
        description="Link details and analytics."
        actions={
          <>
            <QrDialog linkId={link.id} shortUrl={url} />
            <Button asChild variant="outline">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Open
              </a>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/links/${link.slug}/edit`}>
                <Pencil />
                Edit
              </Link>
            </Button>
          </>
        }
      />

      {/* Meta card */}
      <Card className="mb-6">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Short URL">
            <div className="flex items-center gap-1">
              <code className="truncate text-sm">{url}</code>
              <CopyButton value={url} size="icon" className="h-7 w-7" />
            </div>
          </Meta>
          <Meta label="Destination">
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
          <Meta label="Status">
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </Meta>
          <Meta label="Created">
            <span className="text-sm">{formatDateTime(link.createdAt)}</span>
          </Meta>
          <Meta label="Last click">
            <span className="text-sm">
              {counts.lastClick ? formatDateTime(counts.lastClick) : "—"}
            </span>
          </Meta>
          {link.expiresAt && (
            <Meta label="Expires">
              <span className="text-sm">{formatDateTime(link.expiresAt)}</span>
            </Meta>
          )}
          {link.campaign && (
            <Meta label="Campaign">
              <span className="text-sm">{link.campaign.name}</span>
            </Meta>
          )}
          <Meta label="Traffic source">
            <span className="text-sm">
              {formatNumber(analytics.source.link)} link ·{" "}
              {formatNumber(analytics.source.qr)} QR
            </span>
          </Meta>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total clicks"
          value={formatNumber(counts.totalClicks)}
          hint={`${formatNumber(counts.humanClicks)} human · ${formatNumber(
            counts.botClicks,
          )} bot`}
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
        <StatCard label="Today" value={formatNumber(counts.clicksToday)} />
        <StatCard label="This week" value={formatNumber(counts.clicks7d)} />
        <StatCard label="This month" value={formatNumber(counts.clicks30d)} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Bot detection and unique/returning visitors are estimates.
      </p>

      {/* Timeline */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Clicks — last 7 days</CardTitle>
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
            alt={link.image.alt || link.title || "Campaign image"}
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
