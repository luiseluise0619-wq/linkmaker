import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health/diagnostics endpoint. The only hard requirement is a reachable,
 * migrated database — signing secrets and the app URL are auto-managed when
 * their env vars are absent. Returns booleans only, never secret values.
 */
export async function GET() {
  let db = false;
  let migrated = false;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
    await prisma.user.count(); // succeeds only if migrations have been applied
    migrated = true;
  } catch (e) {
    dbError =
      e instanceof Error ? e.message.split("\n").slice(0, 2).join(" ") : "error";
  }

  const config = {
    // Required.
    database: db,
    migrationsApplied: migrated,
    // Optional overrides (auto-managed when unset — informational only).
    authSecretFromEnv: (process.env.AUTH_SECRET?.length ?? 0) >= 16,
    analyticsSaltFromEnv: !!process.env.ANALYTICS_SALT,
    appUrlConfigured:
      !!process.env.NEXT_PUBLIC_APP_URL ||
      !!process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      !!process.env.VERCEL_URL,
  };

  const ok = db && migrated;
  const body = { ok, config, dbError };
  return ok
    ? jsonOk(body)
    : NextResponse.json({ ok: false, data: body }, { status: 503 });
}
