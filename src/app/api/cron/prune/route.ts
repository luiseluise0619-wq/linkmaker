import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deletes click events older than the configured retention window.
 *
 * Intended to be triggered by Vercel Cron. Protected by CRON_SECRET: the
 * request must send `Authorization: Bearer <CRON_SECRET>`. Vercel Cron sends
 * this automatically when the secret is configured.
 */
export async function GET(req: NextRequest) {
  // Fail closed: this endpoint deletes data, so refuse unless a secret is
  // configured AND presented. Never run unauthenticated.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return jsonError("Cron is not configured (set CRON_SECRET).", 503);
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return jsonError("Unauthorized.", 401);
  }

  const days = Number(process.env.ANALYTICS_RETENTION_DAYS || "365");
  if (!Number.isFinite(days) || days <= 0) {
    return jsonError("Invalid ANALYTICS_RETENTION_DAYS.", 400);
  }

  const cutoff = new Date(Date.now() - days * 86400000);
  const result = await prisma.linkEvent.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });

  return jsonOk({ deleted: result.count, cutoff: cutoff.toISOString() });
}
