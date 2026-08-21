import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonUnauthorized } from "@/lib/api";
import { toCsv, csvResponse } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 100000;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * CSV of the workspace's raw click events (privacy-safe: no IPs or visitor
 * hashes). Includes the incoming platform — device, OS, browser — plus
 * referrer, country, source (link vs QR), bot flag and UTM tags.
 */
export async function GET() {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();

  const rows = await prisma.$queryRaw<
    {
      timestamp: Date;
      slug: string;
      deviceType: string;
      deviceVendor: string | null;
      deviceModel: string | null;
      cpuArch: string | null;
      os: string | null;
      osVersion: string | null;
      browser: string | null;
      browserVersion: string | null;
      engine: string | null;
      referrerDomain: string | null;
      country: string | null;
      region: string | null;
      city: string | null;
      timezone: string | null;
      language: string | null;
      source: string;
      isBot: boolean;
      hour: number;
      dayOfWeek: number;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      utmTerm: string | null;
      utmContent: string | null;
    }[]
  >`
    SELECT e."timestamp", l.slug, e."deviceType"::text AS "deviceType",
           e."deviceVendor", e."deviceModel", e."cpuArch",
           e.os, e."osVersion", e.browser, e."browserVersion", e.engine,
           e."referrerDomain", e.country, e.region, e.city, e.timezone,
           e.language, e.source::text AS source,
           e."isBot", e.hour, e."dayOfWeek",
           e."utmSource", e."utmMedium", e."utmCampaign",
           e."utmTerm", e."utmContent"
    FROM "link_events" e
    JOIN "links" l ON e."linkId" = l.id
    WHERE l."userId" = ${user.id}
    ORDER BY e."timestamp" DESC
    LIMIT ${MAX_ROWS}
  `;

  const csv = toCsv(
    [
      "Timestamp (UTC)",
      "Link",
      "Source",
      "Device",
      "Device vendor",
      "Device model",
      "CPU",
      "OS",
      "OS version",
      "Browser",
      "Browser version",
      "Engine",
      "Referrer domain",
      "Country",
      "Region",
      "City",
      "Timezone",
      "Language",
      "Hour (UTC)",
      "Weekday",
      "Bot?",
      "UTM source",
      "UTM medium",
      "UTM campaign",
      "UTM term",
      "UTM content",
    ],
    rows.map((r) => [
      r.timestamp,
      `/go/${r.slug}`,
      r.source,
      r.deviceType,
      r.deviceVendor,
      r.deviceModel,
      r.cpuArch,
      r.os,
      r.osVersion,
      r.browser,
      r.browserVersion,
      r.engine,
      r.referrerDomain,
      r.country,
      r.region,
      r.city,
      r.timezone,
      r.language,
      r.hour,
      WEEKDAYS[r.dayOfWeek] ?? r.dayOfWeek,
      r.isBot ? "yes" : "no",
      r.utmSource,
      r.utmMedium,
      r.utmCampaign,
      r.utmTerm,
      r.utmContent,
    ]),
  );

  return csvResponse("linkmaker-events.csv", csv);
}
