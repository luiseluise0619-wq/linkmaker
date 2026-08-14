/**
 * Lightweight in-memory rate limiter (fixed window).
 *
 * NOTE: This is per-instance. On a single Vercel instance it protects against
 * casual abuse. For strict multi-instance limiting, swap the store for a
 * shared backend (e.g. Upstash Redis) — the interface below is intentionally
 * simple so it can be replaced without touching call sites.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Opportunistic cleanup to bound memory.
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

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, limit, resetAt };
  }
  if (bucket.count >= limit) {
    return { success: false, remaining: 0, limit, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return {
    success: true,
    remaining: limit - bucket.count,
    limit,
    resetAt: bucket.resetAt,
  };
}
