// ============================================================================
// [파일 목적] 클릭 이벤트(방문 기록)를 CSV 파일로 내보내기(export) 하는 라우트
// - CSV: 엑셀 등에서 열 수 있는 표 형식의 텍스트 파일(콤마로 값 구분).
// - 로그인한 사용자 본인 데이터만 내보냅니다(다른 사람 데이터 접근 방지).
// - 개인정보 보호: IP나 방문자 해시 같은 민감 정보는 포함하지 않습니다.
// ============================================================================
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonUnauthorized } from "@/lib/api";
import { toCsv, csvResponse } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 한 번에 내보낼 수 있는 최대 줄 수. 너무 큰 파일이 만들어지는 것을 막습니다.
const MAX_ROWS = 100000;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * CSV of the workspace's raw click events (privacy-safe: no IPs or visitor
 * hashes). Includes the incoming platform — device, OS, browser — plus
 * referrer, country, source (link vs QR), bot flag and UTM tags.
 */
// GET 요청 처리: 사용자가 "이벤트 CSV 내려받기"를 누르면 실행됩니다.
export async function GET() {
  // requireDbUser(): 현재 세션에 해당하는 사용자를 데이터베이스에서 찾습니다.
  const user = await requireDbUser();
  // 사용자가 없으면(비로그인/세션 없음) 401 Unauthorized 로 응답합니다.
  if (!user) return jsonUnauthorized();

  // $queryRaw: SQL을 직접 실행해 데이터를 가져옵니다. <...> 안은 결과 각 줄의 타입.
  // 핵심: WHERE l."userId" = ${user.id} 조건으로 "내 링크의 이벤트만" 가져옵니다(소유권 검사).
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

  // toCsv(헤더 배열, 데이터 줄 배열): 값들을 CSV 텍스트로 변환합니다.
  // 첫 번째 배열은 표의 제목 줄(열 이름), 두 번째는 실제 데이터 줄들입니다.
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

  // csvResponse: 파일 이름과 CSV 내용을 받아, 브라우저가 파일로 내려받도록
  // 적절한 헤더(Content-Type, Content-Disposition 등)를 붙여 응답을 만듭니다.
  return csvResponse("linkmaker-events.csv", csv);
}
