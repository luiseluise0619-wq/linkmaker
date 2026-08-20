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

  // IMPORTANT: prune guest accounts BEFORE deleting old events, so the
  // "has a real click" check below sees the full event history. (Deleting
  // events first would strip the evidence and wrongly delete an active guest
  // whose only clicks were older than the retention window.)
  //
  // Guests are explicitly ephemeral ("not saved — sign up to keep"), so:
  //  1. orphaned guests with no links, older than a day (abandoned/failed or
  //     scripted no-op flows), and
  //  2. guests past the retention window whose links never received a real
  //     (non-bot) click within the retained history.
  // Deleting the user cascades to their links and events.
  const orphanCutoff = new Date(Date.now() - 86400000);
  const orphanGuests = await prisma.user.deleteMany({
    where: {
      isGuest: true,
      createdAt: { lt: orphanCutoff },
      links: { none: {} },
    },
  });
  const staleGuests = await prisma.user.deleteMany({
    where: {
      isGuest: true,
      createdAt: { lt: cutoff },
      links: { none: { events: { some: { isBot: false } } } },
    },
  });

  // Now prune remaining old events (from links kept above).
  const events = await prisma.linkEvent.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });

  return jsonOk({
    eventsDeleted: events.count,
    guestsDeleted: orphanGuests.count + staleGuests.count,
    cutoff: cutoff.toISOString(),
  });
}
