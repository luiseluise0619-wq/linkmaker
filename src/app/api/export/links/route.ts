import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonUnauthorized } from "@/lib/api";
import { toCsv, csvResponse } from "@/lib/csv";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** CSV of all of the workspace's links with their headline stats. */
export async function GET() {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();

  const rows = await prisma.$queryRaw<
    {
      slug: string;
      destinationUrl: string;
      title: string | null;
      status: string;
      createdAt: Date;
      total: bigint;
      human: bigint;
      bot: bigint;
      unique_v: bigint;
      last_click: Date | null;
    }[]
  >`
    SELECT l.slug, l."destinationUrl", l.title, l.status::text AS status,
           l."createdAt",
           COUNT(e.id)::bigint AS total,
           COUNT(e.id) FILTER (WHERE e."isBot" = false)::bigint AS human,
           COUNT(e.id) FILTER (WHERE e."isBot" = true)::bigint AS bot,
           COUNT(DISTINCT e."visitorHash") FILTER (WHERE e."isBot" = false)::bigint AS unique_v,
           MAX(e."timestamp") FILTER (WHERE e."isBot" = false) AS last_click
    FROM "links" l
    LEFT JOIN "link_events" e ON e."linkId" = l.id
    WHERE l."userId" = ${user.id}
    GROUP BY l.id
    ORDER BY total DESC
  `;

  const csv = toCsv(
    [
      "Short URL",
      "Destination",
      "Title",
      "Status",
      "Created",
      "Total clicks",
      "Human clicks",
      "Bot clicks",
      "Unique visitors (est)",
      "Last click",
    ],
    rows.map((r) => [
      shortUrl(r.slug),
      r.destinationUrl,
      r.title,
      r.status,
      r.createdAt,
      Number(r.total),
      Number(r.human),
      Number(r.bot),
      Number(r.unique_v),
      r.last_click,
    ]),
  );

  return csvResponse("linkmaker-links.csv", csv);
}
