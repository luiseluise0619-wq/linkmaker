import Link from "next/link";
import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { getDashboardToken, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { logoutAction } from "@/lib/actions/auth";
import { dashboardUrl, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ResetMetricsButton } from "@/components/dashboard/reset-metrics-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const [token, linkCount, eventCount] = await Promise.all([
    getDashboardToken(user.id),
    prisma.link.count({ where: { userId: user.id } }),
    prisma.linkEvent.count({ where: { link: { userId: user.id } } }),
  ]);
  const retention = process.env.ANALYTICS_RETENTION_DAYS || "365";
  const dashUrl = dashboardUrl(token);

  return (
    <>
      <PageHeader title="Settings" description="Your workspace and preferences." />

      <div className="mx-auto max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard link</CardTitle>
            <CardDescription>
              This is how you get back to this workspace — no account or password.
              Save it. Anyone with the link can access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <code className="flex-1 truncate text-sm">{dashUrl}</code>
              <CopyButton value={dashUrl} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Links" value={formatNumber(linkCount)} />
            <Separator />
            <Row label="Recorded click events" value={formatNumber(eventCount)} />
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Image storage
              </span>
              <Badge variant={isStorageConfigured() ? "success" : "secondary"}>
                {isStorageConfigured() ? "Configured" : "Not configured"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reset analytics</CardTitle>
            <CardDescription>
              Clear all recorded clicks and set every number back to zero. Your
              links keep working.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetMetricsButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy &amp; data</CardTitle>
            <CardDescription>How your analytics data is handled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Data retention" value={`${retention} days`} />
            <p className="text-sm text-muted-foreground">
              We never store raw IP addresses; unique visitors are estimated with
              rotating, salted hashes.
            </p>
            <Link
              href="/privacy"
              className="text-sm font-medium text-primary hover:underline"
            >
              Read the privacy policy →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New workspace</CardTitle>
            <CardDescription>
              Start fresh with an empty workspace. Your current links stay
              reachable via the dashboard link above — save it first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                <LogOut />
                Start a new workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
