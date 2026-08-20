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
      os: string | null;
      browser: string | null;
      browserVersion: string | null;
      referrerDomain: string | null;
      country: string | null;
      region: string | null;
      language: string | null;
      source: string;
      isBot: boolean;
      hour: number;
      dayOfWeek: number;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
    }[]
  >`
    SELECT e."timestamp", l.slug, e."deviceType"::text AS "deviceType",
           e.os, e.browser, e."browserVersion", e."referrerDomain",
           e.country, e.region, e.language, e.source::text AS source,
           e."isBot", e.hour, e."dayOfWeek",
           e."utmSource", e."utmMedium", e."utmCampaign"
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
      "OS",
      "Browser",
      "Browser version",
      "Referrer domain",
      "Country",
      "Region",
      "Language",
      "Hour (UTC)",
      "Weekday",
      "Bot?",
      "UTM source",
      "UTM medium",
      "UTM campaign",
    ],
    rows.map((r) => [
      r.timestamp,
      `/go/${r.slug}`,
      r.source,
      r.deviceType,
      r.os,
      r.browser,
      r.browserVersion,
      r.referrerDomain,
      r.country,
      r.region,
      r.language,
      r.hour,
      WEEKDAYS[r.dayOfWeek] ?? r.dayOfWeek,
      r.isBot ? "yes" : "no",
      r.utmSource,
      r.utmMedium,
      r.utmCampaign,
    ]),
  );

  return csvResponse("linkmaker-events.csv", csv);
}
