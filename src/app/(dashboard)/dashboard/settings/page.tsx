import Link from "next/link";
import type { Metadata } from "next";
import { Download, LogOut } from "lucide-react";
import { getDashboardToken, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { logoutAction } from "@/lib/actions/auth";
import { dashboardUrl, formatNumber } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ResetMetricsButton } from "@/components/dashboard/reset-metrics-button";
import { DeleteAllLinksButton } from "@/components/dashboard/delete-all-button";
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
  const t = getT();
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
      <PageHeader
        title={t("forms.settingsTitle")}
        description={t("forms.settingsDesc")}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("forms.dashboardLinkTitle")}</CardTitle>
            <CardDescription>
              {t("forms.dashboardLinkDesc")}
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
            <CardTitle>{t("forms.usageTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("forms.usageLinks")} value={formatNumber(linkCount)} />
            <Separator />
            <Row
              label={t("forms.usageClickEvents")}
              value={formatNumber(eventCount)}
            />
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("forms.imageStorage")}
              </span>
              <Badge variant={isStorageConfigured() ? "success" : "secondary"}>
                {isStorageConfigured()
                  ? t("forms.configured")
                  : t("forms.notConfigured")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("forms.exportTitle")}</CardTitle>
            <CardDescription>
              {t("forms.exportDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/api/export/links" download>
                <Download />
                {t("forms.linksCsv")}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export/events" download>
                <Download />
                {t("forms.eventsCsv")}
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("forms.resetAnalytics")}</CardTitle>
            <CardDescription>
              {t("forms.resetAnalyticsCardDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetMetricsButton />
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>{t("forms.deleteAllLinks")}</CardTitle>
            <CardDescription>
              {t("forms.deleteAllLinksCardDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAllLinksButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("forms.privacyTitle")}</CardTitle>
            <CardDescription>{t("forms.privacyDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row
              label={t("forms.dataRetention")}
              value={t("forms.daysValue", { days: retention })}
            />
            <p className="text-sm text-muted-foreground">
              {t("forms.privacyNote")}
            </p>
            <Link
              href="/privacy"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("forms.readPrivacyPolicy")} →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("forms.newWorkspaceTitle")}</CardTitle>
            <CardDescription>
              {t("forms.newWorkspaceDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                <LogOut />
                {t("forms.startNewWorkspace")}
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
