/**
 * Lightweight in-memory rate limiter (fixed window).
 *
 * NOTE: This is per-instance. On a single Vercel instance it protects against
 * casual abuse. For strict multi-instance limiting, swap the store for a
 * shared backend (e.g. Upstash Redis) — the interface below is intentionally
 * simple so it can be replaced without touching call sites.
 */

// [고정 윈도우(fixed window) 방식이란?]
// 예: "1분에 120번"이면, 1분짜리 시간 창(window)마다 카운터를 0부터 센다.
// 창이 끝나면 카운터가 초기화되고 다시 0부터 시작한다. 구현이 단순하다.

// 하나의 키(예: 특정 IP)에 대한 카운터 정보.
interface Bucket {
  count: number; // 이번 창에서 지금까지 몇 번 요청했는지
  resetAt: number; // 이 창이 끝나고 카운터가 초기화되는 시각(ms)
}

// 키 → 카운터. 서버 메모리에만 존재한다(=서버가 재시작되면 사라짐).
const store = new Map<string, Bucket>();

// 메모리가 무한정 커지지 않도록, 항목이 5000개를 넘으면 만료된 것들을 지운다.
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

// key: 무엇을 기준으로 셀지(예: `go:1.2.3.4`).
// limit: 창 하나에서 허용하는 최대 횟수.  windowMs: 창의 길이(밀리초).
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = store.get(key);
  // 처음 보는 키이거나, 이전 창이 이미 끝났으면 → 새 창을 시작(카운트 1).
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, limit, resetAt };
  }
  // 한도를 이미 다 썼으면 거부(success: false).
  if (bucket.count >= limit) {
    return { success: false, remaining: 0, limit, resetAt: bucket.resetAt };
  }
  // 아직 여유가 있으면 카운트를 1 늘리고 허용.
  bucket.count += 1;
  return {
    success: true,
    remaining: limit - bucket.count,
    limit,
    resetAt: bucket.resetAt,
  };
}
