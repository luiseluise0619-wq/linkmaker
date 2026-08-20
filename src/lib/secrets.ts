import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";

/**
 * Server-managed secrets. If the corresponding environment variable is set, it
 * always wins. Otherwise a strong random value is generated once and persisted
 * in the database, so the app can run with ONLY a database configured — no
 * secrets to paste. Values are cached in memory after first read.
 *
 * Note: setting the env vars explicitly is still recommended for production
 * (rotation, and so the secret isn't only in the app database).
 */

const cache = new Map<string, string>();

async function getOrCreateSetting(key: string): Promise<string> {
  const cached = cache.get(key);
  if (cached) return cached;

  const existing = await prisma.setting.findUnique({ where: { key } });
  if (existing) {
    cache.set(key, existing.value);
    return existing.value;
  }

  const value = randomBytes(32).toString("base64");
  // upsert avoids a race if two requests generate at once.
  const row = await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: {},
  });
  cache.set(key, row.value);
  return row.value;
}

export async function getAuthSecret(): Promise<string> {
  // Any non-empty AUTH_SECRET wins, so an explicitly-set value is never
  // silently dropped (a strong, >=32-char value is strongly recommended).
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv) return fromEnv;
  return getOrCreateSetting("authSecret");
}

export async function getAnalyticsSalt(): Promise<string> {
  const fromEnv = process.env.ANALYTICS_SALT;
  if (fromEnv) return fromEnv;
  return getOrCreateSetting("analyticsSalt");
}
