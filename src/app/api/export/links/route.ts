// ============================================================================
// [파일 목적] 내 링크 목록 + 주요 통계를 CSV 파일로 내보내기 하는 라우트
// - 링크마다 총 클릭수, 사람 클릭수, 봇 클릭수, 추정 순 방문자수, 마지막 클릭 시각
//   같은 요약 지표를 함께 담습니다.
// - 로그인한 사용자 본인 소유 링크만 대상으로 합니다.
// ============================================================================
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonUnauthorized } from "@/lib/api";
import { toCsv, csvResponse } from "@/lib/csv";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** CSV of all of the workspace's links with their headline stats. */
// GET 요청 처리: "링크 CSV 내려받기"를 누르면 실행됩니다.
export async function GET() {
  const user = await requireDbUser();
  // 비로그인 상태면 401 Unauthorized.
  if (!user) return jsonUnauthorized();

  // SQL 직접 실행: 링크(links)와 클릭 이벤트(link_events)를 합쳐(JOIN) 집계합니다.
  // WHERE l."userId" = ${user.id} 로 "내 링크만" 골라냅니다(소유권 검사).
  // COUNT ... FILTER: 조건에 맞는 것만 세기(예: 봇이 아닌 클릭만 세어 human 계산).
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

  // 표의 제목 줄(열 이름)과 데이터 줄들을 CSV 텍스트로 변환합니다.
  // bigint(아주 큰 정수) 값은 Number(...)로 일반 숫자로 바꿔서 담습니다.
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

  // 브라우저가 CSV 파일로 내려받도록 응답을 만들어 돌려줍니다.
  return csvResponse("linkmaker-links.csv", csv);
}
