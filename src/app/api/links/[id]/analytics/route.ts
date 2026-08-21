// ============================================================================
// [파일 목적] 링크 하나의 통계(analytics) 데이터를 조회하는 라우트
// - 클릭 추이, 기기/국가별 분포 등 대시보드 그래프에 쓰이는 집계 정보를 돌려줍니다.
// - 내 소유 링크인지 먼저 확인한 뒤에만 통계를 계산합니다.
// ============================================================================
import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { getOwnedLink } from "@/lib/links";
import { getLinkAnalytics } from "@/lib/stats";
import { jsonNotFound, jsonOk, jsonUnauthorized } from "@/lib/api";

export const runtime = "nodejs";

// GET: params.id 링크의 통계를 조회합니다.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized(); // 비로그인이면 401
  // 소유권 확인: 내 것이 아니거나 없으면 404.
  const link = await getOwnedLink(user.id, params.id);
  if (!link) return jsonNotFound("Link");
  // 통계 계산(집계). 그 결과를 linkId와 함께 담아 200 OK로 반환.
  const analytics = await getLinkAnalytics(link.id);
  return jsonOk({ linkId: link.id, ...analytics });
}
