// ============================================================================
// [파일 목적] 링크 "목록 조회(GET)"와 "새 링크 생성(POST)"을 담당하는 라우트
// - Route Handler(라우트 핸들러): App Router에서 특정 URL 요청을 처리하는 함수.
//   함수 이름(GET/POST 등)이 곧 처리할 HTTP 메서드입니다.
//   GET = 데이터 읽기, POST = 데이터 새로 만들기.
// - 모든 요청은 로그인 사용자를 확인하고, 본인 데이터(userId)만 다룹니다.
// ============================================================================
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLink, LinkError } from "@/lib/links";
import { createLinkSchema } from "@/lib/validations";
import {
  handleZodError,
  jsonError,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/request";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";

// GET: 내 링크 목록을 페이지 단위로 조회합니다(검색/상태 필터 지원).
export async function GET(req: NextRequest) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized(); // 비로그인이면 401

  // URL의 쿼리스트링(?page=2&q=... 등)에서 조건 값을 읽어옵니다.
  const { searchParams } = new URL(req.url);
  // page: 몇 번째 페이지인지. 최소 1페이지로 보정합니다.
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  // pageSize: 한 페이지에 몇 개 보여줄지. 1~100 사이로 제한합니다(과도한 요청 방지).
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? 20) || 20),
  );
  const q = searchParams.get("q")?.trim(); // 검색어(선택)
  const status = searchParams.get("status"); // 상태 필터(선택)

  // where: 데이터베이스에서 걸러낼 조건 모음.
  // userId를 항상 포함하므로 "내 링크"만 조회됩니다(다른 사람 링크 접근 차단).
  const where: import("@prisma/client").Prisma.LinkWhereInput = {
    userId: user.id,
  };
  // 상태 필터가 유효한 값일 때만 조건에 추가합니다.
  if (status === "ACTIVE" || status === "DISABLED") where.status = status;
  if (q) {
    // 검색어가 있으면 slug/제목/도착URL 중 하나라도 포함되면 매칭(대소문자 무시).
    where.OR = [
      { slug: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { destinationUrl: { contains: q, mode: "insensitive" } },
    ];
  }

  // Promise.all: 두 쿼리(전체 개수 세기 + 현재 페이지 목록 가져오기)를 동시에 실행해 더 빠릅니다.
  const [total, links] = await Promise.all([
    prisma.link.count({ where }),
    prisma.link.findMany({
      where,
      include: { image: true, _count: { select: { events: true } } },
      orderBy: { createdAt: "desc" }, // 최신순 정렬
      skip: (page - 1) * pageSize, // 앞 페이지들의 항목 수만큼 건너뛰기
      take: pageSize, // 이번 페이지에 가져올 개수
    }),
  ]);

  // 200 OK: 화면에 필요한 정보만 골라 담아 목록과 페이지 정보를 반환합니다.
  return jsonOk({
    links: links.map((l) => ({
      id: l.id,
      slug: l.slug,
      shortUrl: shortUrl(l.slug),
      destinationUrl: l.destinationUrl,
      title: l.title,
      status: l.status,
      expiresAt: l.expiresAt,
      clicks: l._count.events,
      hasImage: !!l.image,
      createdAt: l.createdAt,
    })),
    pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  });
}

// POST: 새 링크를 만듭니다(요청 본문의 JSON 데이터로 생성).
export async function POST(req: NextRequest) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized(); // 비로그인이면 401

  // 요청 보낸 사람의 IP 주소를 구합니다(아래 rate limit 식별자에 사용).
  const ip = getClientIp(req);
  // rate limit(요청 속도 제한): 같은 사용자/IP가 60초(60_000ms) 동안 30번까지만 허용.
  // 짧은 시간에 너무 많이 만드는 남용/공격을 막습니다.
  const rl = rateLimit(`api:create:${user.id}:${ip ?? ""}`, 30, 60_000);
  // 429 Too Many Requests: 허용 횟수를 초과했다는 상태코드.
  if (!rl.success) return jsonError("Rate limit exceeded. Try again soon.", 429);

  // 요청 본문(body)을 JSON으로 읽습니다. 형식이 깨져 있으면 400으로 응답.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400); // 400 Bad Request
  }

  // zod 스키마로 입력값을 검증합니다(필수 값/형식 확인).
  // safeParse: 예외를 던지지 않고 성공/실패 결과를 돌려줍니다.
  const parsed = createLinkSchema.safeParse(body);
  // 검증 실패 시 어떤 항목이 잘못됐는지 담은 에러 응답을 반환합니다.
  if (!parsed.success) return handleZodError(parsed.error as z.ZodError);

  try {
    // 실제 링크 생성. user.id를 넘겨 이 링크의 소유자를 현재 사용자로 지정합니다.
    const link = await createLink(user.id, parsed.data);
    // 201 Created: 새 자원이 성공적으로 만들어졌다는 상태코드.
    return jsonOk(
      {
        id: link.id,
        slug: link.slug,
        shortUrl: shortUrl(link.slug),
        destinationUrl: link.destinationUrl,
      },
      { status: 201 },
    );
  } catch (e) {
    // LinkError: 링크 관련 예상된 오류(예: 중복 slug). 그에 맞는 상태코드로 응답.
    if (e instanceof LinkError) return jsonError(e.message, e.status);
    // 그 외 예상 못한 오류는 500 Internal Server Error.
    return jsonError("Could not create the link.", 500);
  }
}
