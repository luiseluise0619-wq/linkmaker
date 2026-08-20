import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ultra-light keep-warm endpoint. Runs a trivial query so that pinging this URL
 * (e.g. from a free uptime monitor every few minutes) keeps an auto-suspending
 * database awake, avoiding cold-start delays on the next real click.
 *
 * NOTE: keeping the database always awake consumes continuous compute, which
 * can exceed a free database tier's monthly compute allowance. Use sparingly.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
