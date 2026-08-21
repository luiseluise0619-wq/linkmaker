// ============================================================================
// [파일 목적] 상태 점검(health check) 라우트
// - 서비스가 정상 동작하는지 확인하는 진단용 엔드포인트입니다.
// - 꼭 필요한 조건은 "데이터베이스에 연결되고 마이그레이션(스키마 적용)이 끝났는지".
// - 보안: 비밀 값 자체는 절대 반환하지 않고, "있다/없다"(true/false)만 알려줍니다.
// ============================================================================
import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health/diagnostics endpoint. The only hard requirement is a reachable,
 * migrated database — signing secrets and the app URL are auto-managed when
 * their env vars are absent. Returns booleans only, never secret values.
 */
// GET 요청 처리: 이 주소를 호출하면 서비스 상태를 점검해서 알려줍니다.
export async function GET() {
  let db = false; // DB 연결 성공 여부
  let migrated = false; // 마이그레이션(테이블 생성 등) 적용 여부
  let dbError: string | null = null; // 문제가 있으면 에러 메시지 앞부분만 담음
  try {
    // SELECT 1: 가장 가벼운 쿼리. 성공하면 DB에 연결이 된다는 뜻.
    await prisma.$queryRaw`SELECT 1`;
    db = true;
    // user 테이블 개수 세기: 테이블이 있어야(=마이그레이션 완료) 성공합니다.
    await prisma.user.count(); // succeeds only if migrations have been applied
    migrated = true;
  } catch (e) {
    // 실패하면 에러 메시지의 처음 두 줄만 저장(너무 길거나 민감한 내용 노출 방지).
    dbError =
      e instanceof Error ? e.message.split("\n").slice(0, 2).join(" ") : "error";
  }

  // 설정 상태 요약. 비밀 값이 아니라 "설정되어 있는가(true/false)"만 담습니다.
  const config = {
    // Required.
    database: db,
    migrationsApplied: migrated,
    // Optional overrides (auto-managed when unset — informational only).
    authSecretFromEnv: !!process.env.AUTH_SECRET,
    analyticsSaltFromEnv: !!process.env.ANALYTICS_SALT,
    appUrlConfigured:
      !!process.env.NEXT_PUBLIC_APP_URL ||
      !!process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      !!process.env.VERCEL_URL,
  };

  // DB 연결과 마이그레이션이 모두 정상일 때만 전체 상태를 정상(ok=true)으로 봅니다.
  const ok = db && migrated;
  const body = { ok, config, dbError };
  // 정상이면 200 OK, 아니면 503 Service Unavailable(서비스 이용 불가) 상태코드를 반환.
  return ok
    ? jsonOk(body)
    : NextResponse.json({ ok: false, data: body }, { status: 503 });
}
