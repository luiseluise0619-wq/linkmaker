import Link from "next/link";
import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { logoutAction } from "@/lib/actions/auth";
import { formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [linkCount, eventCount] = await Promise.all([
    prisma.link.count({ where: { userId: user.id } }),
    prisma.linkEvent.count({ where: { link: { userId: user.id } } }),
  ]);
  const retention = process.env.ANALYTICS_RETENTION_DAYS || "365";

  return (
    <>
      <PageHeader title="Settings" description="Your account and preferences." />

      <div className="mx-auto max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Name" value={user.name || "—"} />
            <Separator />
            <Row label="Email" value={user.email} />
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
            <CardTitle>Privacy &amp; data</CardTitle>
            <CardDescription>
              How your analytics data is handled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Data retention" value={`${retention} days`} />
            <p className="text-sm text-muted-foreground">
              Click events are retained for the period above (set via{" "}
              <code>ANALYTICS_RETENTION_DAYS</code>). We never store raw IP
              addresses; unique visitors are estimated with rotating, salted
              hashes.
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
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                <LogOut />
                Sign out
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
