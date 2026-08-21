import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { BreakdownList } from "@/components/charts/breakdown-list";
import { getT } from "@/lib/i18n/server";
import { DISPLAY_TZ } from "@/lib/utils";
import type { getLinkAnalytics } from "@/lib/stats";

type Analytics = Awaited<ReturnType<typeof getLinkAnalytics>>;

const DEVICE_LABEL_KEYS: Record<string, string> = {
  MOBILE: "dash.deviceMobile",
  DESKTOP: "dash.deviceDesktop",
  TABLET: "dash.deviceTablet",
  UNKNOWN: "dash.deviceUnknown",
};

export function AnalyticsSections({ analytics }: { analytics: Analytics }) {
  const t = getT();
  const devices = analytics.devices.map((d) => ({
    label: t(DEVICE_LABEL_KEYS[d.label] ?? d.label),
    clicks: d.clicks,
  }));
  const hourData = analytics.byHour.map((h) => ({
    label: String(h.hour).padStart(2, "0"),
    clicks: h.clicks,
  }));
  const weekdayData = analytics.byWeekday.map((d) => ({
    label: d.day,
    clicks: d.clicks,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.hourlyActivity")}</CardTitle>
            <CardDescription>
              {t("dash.clicksByHour", { tz: DISPLAY_TZ })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={hourData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.weekdayActivity")}</CardTitle>
            <CardDescription>{t("dash.clicksByWeekday")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={weekdayData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.devices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={devices} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.browsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={analytics.browsers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.operatingSystems")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={analytics.os} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.countries")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.countries}
              emptyMessage={t("dash.noGeoData")}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.cities")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.cities}
              emptyMessage={t("dash.noCityData")}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.referrers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.referrers}
              emptyMessage={t("dash.noReferrerData")}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.utmSource")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.utmSources}
              emptyMessage={t("dash.noUtmSourceData")}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.utmMedium")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.utmMediums}
              emptyMessage={t("dash.noUtmMediumData")}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.utmCampaigns")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.utm}
              emptyMessage={t("dash.noUtmCampaignData")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
