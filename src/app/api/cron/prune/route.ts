// ============================================================================
// [파일 목적] 오래된 데이터 자동 청소(정리) 라우트
// - Cron(크론): 정해진 시간마다 자동으로 실행되는 예약 작업입니다.
//   여기서는 Vercel Cron이 주기적으로 이 GET 주소를 호출합니다.
// - 하는 일: 보관 기간(retention window)이 지난 오래된 클릭 기록과,
//   버려진/오래된 게스트 계정을 데이터베이스에서 삭제합니다.
// - 이 라우트는 "데이터를 삭제"하므로, 비밀키(CRON_SECRET)로 보호합니다.
// ============================================================================
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { PUBLIC_USER_ID } from "@/lib/links";

// runtime = "nodejs": 이 라우트를 Node.js 환경에서 실행합니다(Edge가 아님).
// dynamic = "force-dynamic": 매번 새로 실행하고 응답을 캐시(저장)하지 않습니다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deletes click events older than the configured retention window.
 *
 * Intended to be triggered by Vercel Cron. Protected by CRON_SECRET: the
 * request must send `Authorization: Bearer <CRON_SECRET>`. Vercel Cron sends
 * this automatically when the secret is configured.
 */
// GET 요청 처리: Cron이 이 주소를 호출하면 아래 코드가 실행됩니다.
export async function GET(req: NextRequest) {
  // [안전 우선(Fail closed)] 이 엔드포인트는 데이터를 삭제하므로,
  // 비밀키가 (1)설정되어 있고 (2)요청에 담겨 와야만 동작합니다.
  // 인증 없이는 절대 실행하지 않습니다.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // 503 Service Unavailable: 서버가 아직 준비/설정되지 않았다는 상태코드.
    // 비밀키가 없으면 기능 자체를 사용할 수 없으므로 503을 돌려줍니다.
    return jsonError("Cron is not configured (set CRON_SECRET).", 503);
  }
  // HTTP 헤더 중 Authorization 값을 읽습니다. Vercel Cron은 비밀키가 설정되면
  // "Authorization: Bearer <CRON_SECRET>" 형식으로 자동으로 보내줍니다.
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    // 401 Unauthorized: 인증에 실패했다는 상태코드(비밀키 불일치).
    return jsonError("Unauthorized.", 401);
  }

  // 보관 기간(일 단위). 환경변수가 없으면 기본 365일을 사용합니다.
  const days = Number(process.env.ANALYTICS_RETENTION_DAYS || "365");
  if (!Number.isFinite(days) || days <= 0) {
    // 400 Bad Request: 요청/설정 값이 잘못되었다는 상태코드.
    return jsonError("Invalid ANALYTICS_RETENTION_DAYS.", 400);
  }

  // cutoff(기준 시각) = 지금 시각 - (보관일수 * 하루). 이 시각보다 오래된 것이 삭제 대상.
  // 86400000 = 24시간을 밀리초로 나타낸 값(1000ms * 60초 * 60분 * 24시간).
  const cutoff = new Date(Date.now() - days * 86400000);

  // IMPORTANT: prune guest accounts BEFORE deleting old events, so the
  // "has a real click" check below sees the full event history. (Deleting
  // events first would strip the evidence and wrongly delete an active guest
  // whose only clicks were older than the retention window.)
  //
  // Guests are explicitly ephemeral ("not saved — sign up to keep"), so:
  //  1. orphaned guests with no links, older than a day (abandoned/failed or
  //     scripted no-op flows), and
  //  2. guests past the retention window whose links never received a real
  //     (non-bot) click within the retained history.
  // Deleting the user cascades to their links and events.
  // orphanCutoff: "하루 전" 시각. 만들어진 지 하루가 지난 대상만 정리합니다.
  const orphanCutoff = new Date(Date.now() - 86400000);
  // 모든 익명 링크를 소유하는 시스템 계정(PUBLIC_USER_ID)은 절대 삭제하지 않습니다.
  // 이 계정을 지우면 연결된 모든 무(無)로그인 링크가 함께 삭제되기 때문입니다.
  // (id: { not: PUBLIC_USER_ID } 조건으로 이 계정을 제외합니다.)
  // 1) 링크가 하나도 없는(none: {}) 버려진 게스트 계정을 삭제.
  const orphanGuests = await prisma.user.deleteMany({
    where: {
      id: { not: PUBLIC_USER_ID },
      isGuest: true,
      createdAt: { lt: orphanCutoff },
      links: { none: {} },
    },
  });
  // 2) 보관 기간이 지났고, 보관된 기록 안에서 진짜(봇이 아닌) 클릭이 한 번도 없는
  //    게스트 계정을 삭제. isBot=false 인 이벤트가 하나도 없으면 사실상 미사용 계정.
  const staleGuests = await prisma.user.deleteMany({
    where: {
      id: { not: PUBLIC_USER_ID },
      isGuest: true,
      createdAt: { lt: cutoff },
      links: { none: { events: { some: { isBot: false } } } },
    },
  });

  // 위에서 살아남은 링크들에 남아 있는 오래된 클릭 이벤트를 이제 삭제합니다.
  // (timestamp가 cutoff보다 이전인 것들 = 보관 기간을 넘긴 기록)
  const events = await prisma.linkEvent.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });

  // 200 OK 로 작업 결과를 요약해서 돌려줍니다(삭제된 이벤트 수, 게스트 수, 기준 시각).
  return jsonOk({
    eventsDeleted: events.count,
    guestsDeleted: orphanGuests.count + staleGuests.count,
    cutoff: cutoff.toISOString(),
  });
}
