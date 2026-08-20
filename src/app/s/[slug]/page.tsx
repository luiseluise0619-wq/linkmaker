import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Lock } from "lucide-react";
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
            Stats not available
          </h1>
          <p className="mt-2 text-muted-foreground">
            This analytics link is invalid or missing its access token. Use the
            private stats link you received when the short link was created.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Go to homepage</Link>
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
          Anonymous link analytics. Bookmark this page to check back.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Short URL
            </p>
            <div className="mt-1 flex items-center gap-1">
              <code className="truncate text-sm">{url}</code>
              <CopyButton value={url} size="icon" className="h-7 w-7" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Destination
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
              Created
            </p>
            <p className="mt-1 text-sm">{formatDateTime(link.createdAt)}</p>
          </div>
          <div className="flex items-end">
            <Button asChild variant="outline" size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Open link
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

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
        <StatCard label="Today" value={formatNumber(counts.clicksToday)} />
        <StatCard label="Last 7 days" value={formatNumber(counts.clicks7d)} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Clicks — last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart data={analytics.timeline7d} />
        </CardContent>
      </Card>

      <div className="mt-4">
        <AnalyticsSections analytics={analytics} />
      </div>

      <div className="mt-8 rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        Want to create your own trackable links — no account needed?{" "}
        <Link href="/" className="font-medium text-foreground hover:underline">
          Make one for free
        </Link>
        .
      </div>
    </Shell>
  );
}
