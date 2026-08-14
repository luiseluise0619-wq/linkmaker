import type { NextRequest } from "next/server";

/**
 * Extract a best-effort client IP for rate limiting and (hashed, never stored
 * raw) unique-visitor estimation. Prefers standard proxy headers.
 */
export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? null;
}

/**
 * Coarse geolocation from edge/CDN headers when available. On Vercel these are
 * populated automatically; elsewhere they are simply absent (and we don't
 * pretend otherwise).
 */
export function getGeo(req: NextRequest): {
  country: string | null;
  region: string | null;
} {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  const region =
    req.headers.get("x-vercel-ip-country-region") ||
    req.headers.get("x-vercel-ip-region") ||
    null;
  return { country: country || null, region: region || null };
}
