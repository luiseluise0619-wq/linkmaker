// 이 파일은 앱 전체에서 쓰는 작은 도우미(유틸) 함수 모음이다.
// - URL 만들기(appUrl/shortUrl/dashboardUrl)
// - 숫자/날짜를 보기 좋게 표시하기(formatNumber/formatDate/formatDateTime)
// - 표시용 시간대(한국 시간, KST) 관련 계산(displayOffsetMinutes)

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn = "class names"의 줄임말. 여러 개의 Tailwind CSS 클래스 문자열을 하나로 합쳐준다.
// clsx로 조건부 클래스를 정리하고, twMerge로 서로 충돌하는 클래스(예: px-2와 px-4)를
// 뒤에 온 것만 남도록 깔끔하게 정리한다.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Base URL of the app, without trailing slash.
 *
 * Prefers NEXT_PUBLIC_APP_URL (works on both server and client). On Vercel it
 * falls back to the auto-provided deployment domain, so no env var is needed to
 * get working absolute URLs server-side. */
// appUrl() = 이 앱의 기본 주소(도메인)를 돌려준다. 예: "https://linkmaker.app".
// 환경변수(process.env)에 설정된 값을 우선 쓰고, 없으면 Vercel이 자동으로 주는
// 배포 도메인을 쓰고, 그것도 없으면(내 컴퓨터에서 개발 중일 때) localhost를 쓴다.
// 정규식 /\/+$/ 는 주소 끝에 붙은 슬래시(/)를 모두 지워 주소가 지저분해지지 않게 한다.
export function appUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

// slug(슬러그) = 짧은 링크 주소의 끝부분. 예: /go/abc123 에서 abc123.
// shortUrl()은 슬러그로 실제 접속 가능한 전체 짧은 주소를 만들어 준다.
/** Build the public short URL for a slug. */
export function shortUrl(slug: string): string {
  return `${appUrl()}/go/${slug}`;
}

// token(토큰) = 로그인 없이도 내 대시보드에 다시 들어갈 수 있게 해 주는 비밀 열쇠 문자열.
// 이 함수는 그 토큰으로 대시보드에 접속할 수 있는 전체 주소를 만든다.
/** Build the portable dashboard URL for a workspace token. */
export function dashboardUrl(token: string): string {
  return `${appUrl()}/d/${token}`;
}

// 숫자에 천 단위 콤마를 넣어 읽기 쉽게 만든다. 예: 1234567 -> "1,234,567".
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Display timezone for all dashboard times. Defaults to Korea (KST, UTC+9).
 * Override with the DISPLAY_TIMEZONE env var (e.g. "America/New_York"). */
export const DISPLAY_TZ = process.env.DISPLAY_TIMEZONE || "Asia/Seoul";

// 컴퓨터는 시간을 UTC(세계 표준시)로 저장한다. 사용자에게는 한국 시간(KST, UTC+9)으로
// 보여줘야 하므로, "UTC 시간에 몇 분을 더해야 표시 시간대가 되는가"를 계산한다.
// (한국이라면 보통 +540분 = 9시간). 서머타임이 있는 나라도 정확히 계산되도록
// Intl.DateTimeFormat으로 실제 그 시대의 벽시계 시각을 구해서 차이를 낸다.
/** Minutes to add to a UTC instant to get the display-timezone wall clock. */
export function displayOffsetMinutes(at: Date = new Date()): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: DISPLAY_TZ,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const p: Record<string, number> = {};
    for (const part of dtf.formatToParts(at)) {
      if (part.type !== "literal") p[part.type] = Number(part.value);
    }
    // 표시 시간대의 벽시계 시각을 다시 UTC 숫자로 만든 뒤, 원래 시각과의 차이를 분으로 환산.
    // (60000밀리초 = 1분). 문제가 생기면 catch에서 안전하게 0(차이 없음)을 돌려준다.
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
    return Math.round((asUtc - at.getTime()) / 60000);
  } catch {
    return 0;
  }
}

// 날짜를 "Aug 21, 2026" 형태의 짧은 문자열로 표시한다. 값이 없으면 "—"(대시).
// 표시 시간대(DISPLAY_TZ)를 지정해서 항상 한국 시간 기준 날짜로 보여준다.
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TZ,
  });
}

// 날짜와 시각을 함께 "Aug 21, 2026, 3:04 PM" 형태로 표시한다. 값이 없으면 "—".
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DISPLAY_TZ,
  });
}
