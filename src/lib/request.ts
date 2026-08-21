import type { NextRequest } from "next/server";

/**
 * 방문자의 IP 주소를 최대한 알아낸다(속도 제한과, 되돌릴 수 없게 해시한 방문자 추정에 사용).
 *
 * [왜 헤더에서 읽나?] 서버 앞에는 보통 프록시/CDN(예: Vercel)이 있어서, 실제 접속자
 * IP가 요청 헤더에 담겨 전달된다. `x-real-ip`는 플랫폼이 직접 넣어주는 신뢰할 수 있는
 * 값이라 먼저 사용한다. `x-forwarded-for`의 맨 앞 값은 클라이언트가 위조할 수 있어
 * 신뢰 헤더가 없을 때만 보조로 쓴다.
 */
export function getClientIp(req: NextRequest): string | null {
  // Prefer x-real-ip: on Vercel (and typical reverse proxies) it is set by the
  // platform to the true client IP and cannot be spoofed by the caller. The
  // left-most x-forwarded-for token, by contrast, is whatever the client sent
  // (the platform appends to it), so trusting it would let an attacker rotate
  // the value to defeat the per-IP rate limit. Fall back to XFF only when no
  // trusted header is present.
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return null;
}

/**
 * Coarse geolocation from edge/CDN headers when available. On Vercel these are
 * populated automatically; elsewhere they are simply absent (and we don't
 * pretend otherwise).
 */
export function getGeo(req: NextRequest): {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
} {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  const region =
    req.headers.get("x-vercel-ip-country-region") ||
    req.headers.get("x-vercel-ip-region") ||
    null;
  // City headers are URL-encoded (e.g. "San%20Francisco").
  const rawCity =
    req.headers.get("x-vercel-ip-city") || req.headers.get("cf-ipcity");
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  const timezone =
    req.headers.get("x-vercel-ip-timezone") ||
    req.headers.get("cf-timezone") ||
    null;
  return {
    country: country || null,
    region: region || null,
    city,
    timezone: timezone || null,
  };
}
