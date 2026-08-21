import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 아주 가벼운 "DB 깨우기" 주소. 간단한 쿼리 하나만 실행한다. 무료 모니터링 도구로
 * 몇 분마다 이 주소를 호출하면, 잠들려는 DB를 계속 깨어 있게 해서 다음 진짜 클릭 때
 * 콜드 스타트(깨어나는 지연)를 피할 수 있다.
 *
 * 주의: DB를 계속 깨워두면 컴퓨팅 사용량이 계속 소모되어, 무료 등급의 월 한도를
 * 넘길 수 있다. 꼭 필요할 때만 사용할 것.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
