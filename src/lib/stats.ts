import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { displayOffsetMinutes } from "./utils";

/**
 * 통계 집계 함수 모음. 대시보드의 모든 숫자·그래프는 이 파일의 함수들이 link_events
 * 표를 세고 묶어서 만든다.
 *
 * [기본 규칙] "클릭수"와 "방문자"는 기본적으로 사람(봇 제외) 이벤트만 센다. 봇 수치는
 * 따로 보여주고 "추정치"로 표시한다.
 *
 * [시간대 처리 — 초보자 주의] 클릭 시각은 DB에 UTC(세계 표준시)로 저장된다. 하지만
 * 대시보드는 한국 시간(기본 Asia/Seoul)으로 보여야 하므로, 날짜/시간/요일로 묶을 때
 * UTC 값에 시차(+9시간)를 더해 "현지 시각"으로 바꾼 뒤 계산한다.
 */

export type TimelineRange = "24h" | "7d" | "30d" | "90d";

/** 지금 기준, UTC와 표시 시간대의 시차(분). 서울이면 +540분(=9시간). */
function offsetMinutes(): number {
  return displayOffsetMinutes();
}

/**
 * 그래프의 시작 시각(현지 기준)을 "실제 UTC 시각"으로 계산해 돌려준다.
 *
 * [트릭] JS Date에는 "특정 시간대"라는 개념이 약해서, 이렇게 처리한다:
 *   1) 현재 시각에 시차를 더하면(now + offMs) 시곗바늘이 현지 시각을 가리키게 된다.
 *      (단, JS는 이걸 여전히 UTC로 여긴다 → "현지 시각을 UTC인 척" 다룬다.)
 *   2) 그 상태에서 자정/정시로 맞춘다(현지 기준 경계).
 *   3) 마지막에 시차를 다시 빼서(-offMs) 진짜 UTC 시각으로 되돌린다.
 * 예: 7d면 "6일 전 현지 자정"에 해당하는 실제 UTC 시각을 반환.
 */
function startOf(range: TimelineRange): Date {
  const offMs = offsetMinutes() * 60000;
  // "local" = 지금의 현지 시각을 UTC인 척 담은 값.
  const local = new Date(Date.now() + offMs);
  switch (range) {
    case "24h":
      local.setUTCHours(local.getUTCHours() - 23, 0, 0, 0);
      break;
    case "7d":
      local.setUTCDate(local.getUTCDate() - 6);
      local.setUTCHours(0, 0, 0, 0);
      break;
    case "30d":
      local.setUTCDate(local.getUTCDate() - 29);
      local.setUTCHours(0, 0, 0, 0);
      break;
    case "90d":
      local.setUTCDate(local.getUTCDate() - 89);
      local.setUTCHours(0, 0, 0, 0);
      break;
  }
  return new Date(local.getTime() - offMs); // back to a real UTC instant
}

/** Real UTC instant of local midnight, N local days ago. */
function daysAgo(n: number): Date {
  const offMs = offsetMinutes() * 60000;
  const local = new Date(Date.now() + offMs);
  local.setUTCDate(local.getUTCDate() - n);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - offMs);
}

/** 특정 사용자가 소유한 모든 링크의 id 목록을 가져온다(그 사용자 통계만 보기 위함). */
async function linkIdsForUser(userId: string): Promise<string[]> {
  const links = await prisma.link.findMany({
    where: { userId },
    select: { id: true },
  });
  return links.map((l) => l.id);
}

interface BaseFilter {
  linkIds: string[];
  humanOnly?: boolean;
}

function whereClause(filter: BaseFilter): Prisma.LinkEventWhereInput {
  const where: Prisma.LinkEventWhereInput = {
    linkId: { in: filter.linkIds.length ? filter.linkIds : ["__none__"] },
  };
  if (filter.humanOnly !== false) where.isBot = false;
  return where;
}

export interface CoreCounts {
  totalClicks: number;
  botClicks: number;
  humanClicks: number;
  uniqueVisitors: number;
  returningVisitors: number;
  clicksToday: number;
  clicks7d: number;
  clicks30d: number;
  lastClick: Date | null;
}

async function distinctVisitorCount(
  linkIds: string[],
  since?: Date,
): Promise<number> {
  if (!linkIds.length) return 0;
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT "visitorHash")::bigint AS count
    FROM "link_events"
    WHERE "linkId" = ANY(${linkIds})
      AND "isBot" = false
      AND "visitorHash" IS NOT NULL
      ${since ? Prisma.sql`AND "timestamp" >= ${since}` : Prisma.empty}
  `;
  return Number(rows[0]?.count ?? 0);
}

/**
 * Returning visitors = privacy-preserving visitor hashes that recorded more
 * than one click. Because the hash rotates every day (it embeds the date, by
 * design, so visitors can't be tracked across days), this necessarily counts
 * repeat clicks within a single day. It is an ESTIMATE and a lower bound on
 * true returning visitors — labeled as such in the UI.
 */
async function returningVisitorCount(linkIds: string[]): Promise<number> {
  if (!linkIds.length) return 0;
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM (
      SELECT "visitorHash"
      FROM "link_events"
      WHERE "linkId" = ANY(${linkIds})
        AND "isBot" = false
        AND "visitorHash" IS NOT NULL
      GROUP BY "visitorHash"
      HAVING COUNT(*) > 1
    ) t
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getCoreCounts(linkIds: string[]): Promise<CoreCounts> {
  if (!linkIds.length) {
    return {
      totalClicks: 0,
      botClicks: 0,
      humanClicks: 0,
      uniqueVisitors: 0,
      returningVisitors: 0,
      clicksToday: 0,
      clicks7d: 0,
      clicks30d: 0,
      lastClick: null,
    };
  }
  const idFilter = { linkId: { in: linkIds } };
  const todayStart = daysAgo(0);
  const [total, bots, today, week, month, last, unique, returning] =
    await Promise.all([
      prisma.linkEvent.count({ where: idFilter }),
      prisma.linkEvent.count({ where: { ...idFilter, isBot: true } }),
      prisma.linkEvent.count({
        where: { ...idFilter, isBot: false, timestamp: { gte: todayStart } },
      }),
      prisma.linkEvent.count({
        where: { ...idFilter, isBot: false, timestamp: { gte: daysAgo(6) } },
      }),
      prisma.linkEvent.count({
        where: { ...idFilter, isBot: false, timestamp: { gte: daysAgo(29) } },
      }),
      prisma.linkEvent.findFirst({
        where: idFilter,
        orderBy: { timestamp: "desc" },
        select: { timestamp: true },
      }),
      distinctVisitorCount(linkIds),
      returningVisitorCount(linkIds),
    ]);
  return {
    totalClicks: total,
    botClicks: bots,
    humanClicks: total - bots,
    uniqueVisitors: unique,
    returningVisitors: returning,
    clicksToday: today,
    clicks7d: week,
    clicks30d: month,
    lastClick: last?.timestamp ?? null,
  };
}

export interface TimelinePoint {
  bucket: string;
  clicks: number;
}

export async function getTimeline(
  linkIds: string[],
  range: TimelineRange,
): Promise<TimelinePoint[]> {
  if (!linkIds.length) return [];
  const since = startOf(range); // 이 시각 이후의 클릭만 집계
  const hourly = range === "24h"; // 24시간이면 시간별, 아니면 일별로 묶음
  const off = offsetMinutes();
  // Shift the stored UTC value into the display timezone's wall clock (by
  // adding the offset) BEFORE truncating, so days/hours bucket in local time.
  // The truncated value is a naive local timestamp; we gap-fill in the same
  // "local-as-UTC" space so the keys line up.
  const rows = await prisma.$queryRaw<{ bucket: Date; clicks: bigint }[]>`
    SELECT date_trunc(${hourly ? "hour" : "day"},
             "timestamp" + make_interval(mins => ${off}::int)) AS bucket,
           COUNT(*)::bigint AS clicks
    FROM "link_events"
    WHERE "linkId" = ANY(${linkIds})
      AND "isBot" = false
      AND "timestamp" >= ${since}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;
  // SQL 결과를 "시간키 → 클릭수" 지도로 만든다(예: "2026-08-21" → 12).
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = hourly
      ? r.bucket.toISOString().slice(0, 13)
      : r.bucket.toISOString().slice(0, 10);
    map.set(key, Number(r.clicks));
  }
  // [빈 구간 채우기] 클릭이 0인 날/시간은 SQL 결과에 아예 없다. 그래프가 끊기지 않게
  // 시작~끝까지 모든 구간을 순회하며, 없는 구간은 clicks: 0으로 채워 넣는다.
  const offMs = off * 60000;
  const points: TimelinePoint[] = [];
  const cursor = new Date(since.getTime() + offMs);
  const end = new Date(Date.now() + offMs);
  while (cursor <= end) {
    const key = hourly
      ? cursor.toISOString().slice(0, 13)
      : cursor.toISOString().slice(0, 10);
    const label = hourly
      ? `${cursor.toISOString().slice(11, 13)}:00`
      : cursor.toISOString().slice(5, 10);
    points.push({ bucket: label, clicks: map.get(key) ?? 0 });
    if (hourly) cursor.setUTCHours(cursor.getUTCHours() + 1);
    else cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return points;
}

export interface HourPoint {
  hour: number;
  clicks: number;
}

export async function getClicksByHour(linkIds: string[]): Promise<HourPoint[]> {
  const result: HourPoint[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    clicks: 0,
  }));
  if (!linkIds.length) return result;
  const off = offsetMinutes();
  // Extract the hour in the display timezone (shift the UTC value first).
  const rows = await prisma.$queryRaw<{ hour: number; clicks: bigint }[]>`
    SELECT EXTRACT(HOUR FROM "timestamp" + make_interval(mins => ${off}::int))::int AS hour,
           COUNT(*)::bigint AS clicks
    FROM "link_events"
    WHERE "linkId" = ANY(${linkIds}) AND "isBot" = false
    GROUP BY 1
  `;
  for (const r of rows) {
    if (result[r.hour]) result[r.hour].clicks = Number(r.clicks);
  }
  return result;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface WeekdayPoint {
  day: string;
  clicks: number;
}

export async function getClicksByWeekday(
  linkIds: string[],
): Promise<WeekdayPoint[]> {
  const result: WeekdayPoint[] = WEEKDAYS.map((day) => ({ day, clicks: 0 }));
  if (!linkIds.length) return result;
  const off = offsetMinutes();
  // Day-of-week in the display timezone (0 = Sunday). Postgres DOW matches JS.
  const rows = await prisma.$queryRaw<{ dow: number; clicks: bigint }[]>`
    SELECT EXTRACT(DOW FROM "timestamp" + make_interval(mins => ${off}::int))::int AS dow,
           COUNT(*)::bigint AS clicks
    FROM "link_events"
    WHERE "linkId" = ANY(${linkIds}) AND "isBot" = false
    GROUP BY 1
  `;
  for (const r of rows) {
    if (result[r.dow]) result[r.dow].clicks = Number(r.clicks);
  }
  // Reorder Mon-first for display.
  return [...result.slice(1), result[0]];
}

export interface Breakdown {
  label: string;
  clicks: number;
}

async function genericBreakdown(
  linkIds: string[],
  field:
    | "deviceType"
    | "browser"
    | "os"
    | "country"
    | "city"
    | "referrerDomain"
    | "utmCampaign"
    | "utmSource"
    | "utmMedium",
  limit = 8,
): Promise<Breakdown[]> {
  if (!linkIds.length) return [];
  // Raw SQL so we can order by the TOTAL click count (COUNT(*)) and keep the
  // NULL/"Unknown" group ranked by its real size. (Prisma groupBy could only
  // order by the grouped field's non-null count, which sorts the — often
  // largest — null bucket to the bottom and drops it from the top-N.)
  // `field` comes from the fixed union above, never user input, so raw column
  // interpolation is safe.
  const col = Prisma.raw(`"${field}"`);
  const rows = await prisma.$queryRaw<{ label: string | null; clicks: bigint }[]>`
    SELECT ${col}::text AS label, COUNT(*)::bigint AS clicks
    FROM "link_events"
    WHERE "linkId" = ANY(${linkIds}) AND "isBot" = false
    GROUP BY ${col}
    ORDER BY clicks DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    label: r.label ?? "Unknown",
    clicks: Number(r.clicks),
  }));
}

export const getDeviceBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "deviceType");
export const getBrowserBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "browser");
export const getOsBreakdown = (ids: string[]) => genericBreakdown(ids, "os");
export const getCountryBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "country");
export const getCityBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "city");
export const getReferrerBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "referrerDomain");
export const getUtmCampaignBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "utmCampaign");
export const getUtmSourceBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "utmSource");
export const getUtmMediumBreakdown = (ids: string[]) =>
  genericBreakdown(ids, "utmMedium");

export interface SourceSplit {
  link: number;
  qr: number;
}

export async function getSourceSplit(linkIds: string[]): Promise<SourceSplit> {
  if (!linkIds.length) return { link: 0, qr: 0 };
  const rows = await prisma.linkEvent.groupBy({
    by: ["source"],
    where: whereClause({ linkIds }),
    _count: { _all: true },
  });
  const split: SourceSplit = { link: 0, qr: 0 };
  for (const r of rows) {
    if (r.source === "QR") split.qr = r._count._all;
    else split.link = r._count._all;
  }
  return split;
}

export interface TopLink {
  id: string;
  slug: string;
  title: string | null;
  destinationUrl: string;
  clicks: number;
  uniqueVisitors: number;
  lastClick: Date | null;
}

export type TopLinkSort = "clicks" | "unique" | "recent";

export async function getTopLinks(
  userId: string,
  sort: TopLinkSort = "clicks",
  limit = 10,
): Promise<TopLink[]> {
  const orderSql =
    sort === "unique"
      ? Prisma.sql`unique_visitors DESC`
      : sort === "recent"
        ? Prisma.sql`last_click DESC NULLS LAST`
        : Prisma.sql`clicks DESC`;

  const rows = await prisma.$queryRaw<
    {
      id: string;
      slug: string;
      title: string | null;
      destinationUrl: string;
      clicks: bigint;
      unique_visitors: bigint;
      last_click: Date | null;
    }[]
  >`
    SELECT l.id, l.slug, l.title, l."destinationUrl",
           COUNT(e.id) FILTER (WHERE e."isBot" = false)::bigint AS clicks,
           COUNT(DISTINCT e."visitorHash") FILTER (WHERE e."isBot" = false)::bigint AS unique_visitors,
           MAX(e."timestamp") FILTER (WHERE e."isBot" = false) AS last_click
    FROM "links" l
    LEFT JOIN "link_events" e ON e."linkId" = l.id
    WHERE l."userId" = ${userId}
    GROUP BY l.id
    ORDER BY ${orderSql}
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    destinationUrl: r.destinationUrl,
    clicks: Number(r.clicks),
    uniqueVisitors: Number(r.unique_visitors),
    lastClick: r.last_click,
  }));
}

/** Everything the dashboard overview needs, scoped to a user. */
export async function getDashboardData(userId: string) {
  const linkIds = await linkIdsForUser(userId);
  const [
    counts,
    activeLinks,
    totalLinks,
    timeline,
    devices,
    browsers,
    countries,
    referrers,
    topLinks,
    source,
  ] = await Promise.all([
    getCoreCounts(linkIds),
    prisma.link.count({ where: { userId, status: "ACTIVE" } }),
    prisma.link.count({ where: { userId } }),
    getTimeline(linkIds, "30d"),
    getDeviceBreakdown(linkIds),
    getBrowserBreakdown(linkIds),
    getCountryBreakdown(linkIds),
    getReferrerBreakdown(linkIds),
    getTopLinks(userId, "clicks", 5),
    getSourceSplit(linkIds),
  ]);
  return {
    linkIds,
    counts,
    activeLinks,
    totalLinks,
    timeline,
    devices,
    browsers,
    countries,
    referrers,
    topLinks,
    source,
  };
}

/** Account-wide analytics for the Analytics page. */
export async function getAccountAnalytics(
  userId: string,
  range: TimelineRange,
  topSort: TopLinkSort,
) {
  const linkIds = await linkIdsForUser(userId);
  const [
    counts,
    timeline,
    byHour,
    byWeekday,
    devices,
    browsers,
    os,
    countries,
    cities,
    referrers,
    utm,
    utmSources,
    utmMediums,
    topLinks,
    source,
  ] = await Promise.all([
    getCoreCounts(linkIds),
    getTimeline(linkIds, range),
    getClicksByHour(linkIds),
    getClicksByWeekday(linkIds),
    getDeviceBreakdown(linkIds),
    getBrowserBreakdown(linkIds),
    getOsBreakdown(linkIds),
    getCountryBreakdown(linkIds),
    getCityBreakdown(linkIds),
    getReferrerBreakdown(linkIds),
    getUtmCampaignBreakdown(linkIds),
    getUtmSourceBreakdown(linkIds),
    getUtmMediumBreakdown(linkIds),
    getTopLinks(userId, topSort, 10),
    getSourceSplit(linkIds),
  ]);
  return {
    hasLinks: linkIds.length > 0,
    counts,
    timeline,
    byHour,
    byWeekday,
    devices,
    browsers,
    os,
    countries,
    cities,
    referrers,
    utm,
    utmSources,
    utmMediums,
    topLinks,
    source,
  };
}

/** Everything a single link detail page needs. */
export async function getLinkAnalytics(linkId: string) {
  const linkIds = [linkId];
  const [
    counts,
    timeline7d,
    byHour,
    byWeekday,
    devices,
    browsers,
    os,
    countries,
    cities,
    referrers,
    utm,
    utmSources,
    utmMediums,
    source,
  ] = await Promise.all([
    getCoreCounts(linkIds),
    getTimeline(linkIds, "7d"),
    getClicksByHour(linkIds),
    getClicksByWeekday(linkIds),
    getDeviceBreakdown(linkIds),
    getBrowserBreakdown(linkIds),
    getOsBreakdown(linkIds),
    getCountryBreakdown(linkIds),
    getCityBreakdown(linkIds),
    getReferrerBreakdown(linkIds),
    getUtmCampaignBreakdown(linkIds),
    getUtmSourceBreakdown(linkIds),
    getUtmMediumBreakdown(linkIds),
    getSourceSplit(linkIds),
  ]);
  return {
    counts,
    timeline7d,
    byHour,
    byWeekday,
    devices,
    browsers,
    os,
    countries,
    cities,
    referrers,
    utm,
    utmSources,
    utmMediums,
    source,
  };
}
