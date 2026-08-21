// 이 파일이 이 서비스의 핵심이다.
// 누군가 짧은 링크(/go/무언가)를 클릭하면 여기가 실행되어:
//   1) 남용 방지(속도 제한)  2) DB에서 목적지 주소 찾기  3) 클릭 기록(통계) 남기기
//   4) 진짜 목적지로 보내주기(리다이렉트)
// 를 순서대로 한다.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectEvent } from "@/lib/analytics";
import { getAnalyticsSalt } from "@/lib/secrets";
import { applyUtm } from "@/lib/url";
import { getClientIp, getGeo } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { appUrl } from "@/lib/utils";

export const runtime = "nodejs"; // Node 환경에서 실행(crypto 등 사용)
export const dynamic = "force-dynamic"; // 매 요청마다 새로 실행(캐시 금지)
// 무료 DB가 잠들어 있다 깨어나는 데 몇 초 걸릴 수 있어, 한 요청에 최대 10초까지 허용.
export const maxDuration = 10;

function unavailable(reason: string) {
  const url = new URL("/link-unavailable", appUrl());
  url.searchParams.set("reason", reason);
  // 302 so nothing caches the outcome; state can change at any time.
  return NextResponse.redirect(url, 302);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry a DB read with escalating backoff. A free-tier Postgres that has
 * auto-suspended can take a few seconds to wake, during which the first query
 * may error. We keep retrying (total wait budget ~7s, within the function's
 * time limit) so a SINGLE click waits out the wake-up and succeeds, instead of
 * the visitor having to click several times.
 */
// [왜 재시도?] 무료 등급 DB는 한동안 요청이 없으면 잠든다(auto-suspend). 잠든 DB를
// 처음 깨울 때 첫 쿼리가 잠깐 실패할 수 있다. 그때 곧바로 포기하면 방문자에게 링크가
// 안 열린다. 그래서 점점 간격을 늘리며 여러 번 시도해(총 약 6.6초), 한 번의 클릭으로
// DB가 깨어날 때까지 기다렸다가 성공시킨다.
const RETRY_DELAYS_MS = [400, 700, 1200, 1800, 2500]; // 6번 시도, 합계 약 6.6초
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      return await fn(); // 성공하면 즉시 반환
    } catch (e) {
      lastErr = e; // 실패하면 기억해뒀다가
      const delay = RETRY_DELAYS_MS[i];
      if (delay !== undefined) await sleep(delay); // 잠시 쉬고 다시 시도
    }
  }
  throw lastErr; // 모든 시도가 실패하면 마지막 에러를 던진다
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug; // 주소에서 뽑은 짧은 링크 식별자

  // 공개 엔드포인트이므로 기본적인 남용 방지: 같은 IP는 1분에 120번까지만.
  const ip = getClientIp(req);
  const rl = rateLimit(`go:${ip ?? "unknown"}`, 120, 60_000);
  if (!rl.success) {
    return new NextResponse("Too many requests. Please slow down.", {
      status: 429,
      headers: { "Retry-After": "60", "Cache-Control": "no-store" },
    });
  }

  // Single indexed lookup — the only query on the hot path before redirect.
  // Retried so a waking (auto-suspended) database doesn't drop the redirect.
  let link;
  try {
    link = await withRetry(() =>
      prisma.link.findUnique({
        where: { slug },
        select: {
          id: true,
          destinationUrl: true,
          status: true,
          expiresAt: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmTerm: true,
          utmContent: true,
        },
      }),
    );
  } catch {
    // Database temporarily unreachable — ask the visitor to retry rather than
    // showing a hard error. 503 + Retry-After, no caching.
    return new NextResponse(
      "This link is temporarily unavailable. Please try again in a moment.",
      {
        status: 503,
        headers: { "Retry-After": "2", "Cache-Control": "no-store" },
      },
    );
  }

  // 링크 상태 점검: 없음 / 비활성화됨 / 만료됨이면 안내 페이지로 보낸다.
  if (!link) return unavailable("notfound");
  if (link.status === "DISABLED") return unavailable("disabled");
  if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
    return unavailable("expired");
  }

  // 목적지 주소에 UTM 태그를 붙인다. ?qr=1로 들어오면 QR 스캔으로 간주.
  const destination = applyUtm(link.destinationUrl, link);
  const isQr = req.nextUrl.searchParams.get("qr") === "1";
  const geo = getGeo(req);
  const linkForEvent = link;

  // Record analytics, but cap the wait so it can never delay the redirect past
  // the function's time budget (the lookup above already woke the DB, so this
  // is normally a fast warm write). Failures are swallowed — analytics is
  // best-effort and must never break a redirect.
  // 클릭 1건의 정보를 모아 DB(link_events 테이블)에 한 줄 추가하는 작업.
  // 실패해도 무시(try/catch로 삼킴) — 통계 실패가 링크 열기를 막으면 안 되니까.
  const recordEvent = async () => {
    try {
      const event = collectEvent({
        userAgentHeader: req.headers.get("user-agent"),
        referrerHeader: req.headers.get("referer"),
        languageHeader: req.headers.get("accept-language"),
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        ip,
        isQr,
        linkId: linkForEvent.id,
        salt: await getAnalyticsSalt(),
      });
      await prisma.linkEvent.create({
        data: {
          linkId: linkForEvent.id,
          timestamp: event.timestamp,
          date: event.date,
          hour: event.hour,
          dayOfWeek: event.dayOfWeek,
          referrer: event.referrer,
          referrerDomain: event.referrerDomain,
          userAgent: event.userAgent,
          browser: event.browser,
          browserVersion: event.browserVersion,
          engine: event.engine,
          os: event.os,
          osVersion: event.osVersion,
          deviceType: event.deviceType,
          deviceVendor: event.deviceVendor,
          deviceModel: event.deviceModel,
          cpuArch: event.cpuArch,
          isMobile: event.isMobile,
          language: event.language,
          country: event.country,
          region: event.region,
          city: event.city,
          timezone: event.timezone,
          utmSource: linkForEvent.utmSource,
          utmMedium: linkForEvent.utmMedium,
          utmCampaign: linkForEvent.utmCampaign,
          utmTerm: linkForEvent.utmTerm,
          utmContent: linkForEvent.utmContent,
          source: event.source,
          isBot: event.isBot,
          botReason: event.botReason,
          visitorHash: event.visitorHash,
        },
      });
    } catch {
      // swallow — analytics is best-effort
    }
  };
  // [핵심] 통계 기록은 "최대 2.5초"만 기다린다. 기록이 느려도 리다이렉트가 지연되지
  // 않게 하기 위함(둘 중 먼저 끝나는 쪽을 택함). 통계는 있으면 좋은 것일 뿐,
  // 링크 열기를 절대 방해하면 안 된다.
  await Promise.race([recordEvent(), sleep(2500)]);

  // 진짜 목적지로 이동시킨다. 302 = 임시 이동(캐시하지 않음 → 나중에 목적지를 바꿔도 반영됨).
  return NextResponse.redirect(destination, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
