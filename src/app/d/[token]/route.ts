import { NextRequest, NextResponse } from "next/server";
import { startSessionByToken } from "@/lib/auth";
import { appUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 이동식 대시보드 링크. /d/<토큰> 주소로 들어오면 그 토큰이 유효한지 확인하고,
 * 맞으면 세션 쿠키를 심은 뒤 대시보드를 연다. 덕분에 로그인 없이도 이 링크만 있으면
 * 어느 기기에서든 내 작업공간을 다시 열 수 있다.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const ok = await startSessionByToken(params.token); // 토큰 검증 + 세션 시작
  // 토큰이 맞으면 대시보드로, 틀리면 "링크 없음" 안내 페이지로 보낸다.
  const url = new URL(ok ? "/dashboard" : "/link-unavailable?reason=notfound", appUrl());
  return NextResponse.redirect(url, 302);
}
