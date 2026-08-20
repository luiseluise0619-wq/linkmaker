import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { BreakdownList } from "@/components/charts/breakdown-list";
import type { getLinkAnalytics } from "@/lib/stats";

type Analytics = Awaited<ReturnType<typeof getLinkAnalytics>>;

const DEVICE_LABELS: Record<string, string> = {
  MOBILE: "Mobile",
  DESKTOP: "Desktop",
  TABLET: "Tablet",
  UNKNOWN: "Unknown",
};

export function AnalyticsSections({ analytics }: { analytics: Analytics }) {
  const devices = analytics.devices.map((d) => ({
    label: DEVICE_LABELS[d.label] ?? d.label,
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
            <CardTitle>Hourly activity</CardTitle>
            <CardDescription>Clicks by hour of day (UTC).</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={hourData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekday activity</CardTitle>
            <CardDescription>Clicks by day of week.</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={weekdayData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={devices} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={analytics.browsers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operating systems</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList data={analytics.os} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.countries}
              emptyMessage="No geo data available"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.cities}
              emptyMessage="No city data available"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.referrers}
              emptyMessage="No referrer data yet"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>UTM campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              data={analytics.utm}
              emptyMessage="No UTM data yet"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
