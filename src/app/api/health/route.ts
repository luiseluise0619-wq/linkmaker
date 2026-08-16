import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight health/diagnostics endpoint. Reports whether the required
 * environment variables are present and whether the database is reachable and
 * migrated. Safe to expose: it returns booleans, never secret values.
 */
export async function GET() {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    AUTH_SECRET: (process.env.AUTH_SECRET?.length ?? 0) >= 16,
    ANALYTICS_SALT: !!process.env.ANALYTICS_SALT,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  let db = false;
  let migrated = false;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
    // If the core table exists, migrations have been applied.
    await prisma.user.count();
    migrated = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message.split("\n")[0] : "unknown error";
  }

  const ok = db && migrated && Object.values(env).every(Boolean);
  const body = { ok, env, db, migrated, dbError };
  if (ok) return jsonOk(body);
  return NextResponse.json({ ok: false, data: body }, { status: 503 });
}
