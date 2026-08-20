import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectEvent } from "@/lib/analytics";
import { getAnalyticsSalt } from "@/lib/secrets";
import { applyUtm } from "@/lib/url";
import { getClientIp, getGeo } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { appUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable(reason: string) {
  const url = new URL("/link-unavailable", appUrl());
  url.searchParams.set("reason", reason);
  // 302 so nothing caches the outcome; state can change at any time.
  return NextResponse.redirect(url, 302);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry a DB read a few times with short backoff. Serverless functions hitting
 * a free-tier Postgres that has auto-suspended can see a transient connection
 * error on the first query while the database wakes (~1s); a couple of retries
 * turn that into a successful redirect instead of a failed one.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(250 * (i + 1));
    }
  }
  throw lastErr;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;

  // Basic abuse protection on the public endpoint.
  const ip = getClientIp(req);
  const rl = rateLimit(`go:${ip ?? "unknown"}`, 120, 60_000);
  if (!rl.success) {
    return new NextResponse("Too many requests. Please slow down.", {
      status: 429,
      headers: { "Retry-After": "60", "Cache-Control": "no-store" },
    });
  }

  // Single indexed lookup — the only query on the hot path before redirect.
  // Retried so a waking (auto-suspended) database doesn't drop the redirect.
  let link;
  try {
    link = await withRetry(() =>
      prisma.link.findUnique({
        where: { slug },
        select: {
          id: true,
          destinationUrl: true,
          status: true,
          expiresAt: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmTerm: true,
          utmContent: true,
        },
      }),
    );
  } catch {
    // Database temporarily unreachable — ask the visitor to retry rather than
    // showing a hard error. 503 + Retry-After, no caching.
    return new NextResponse(
      "This link is temporarily unavailable. Please try again in a moment.",
      {
        status: 503,
        headers: { "Retry-After": "2", "Cache-Control": "no-store" },
      },
    );
  }

  if (!link) return unavailable("notfound");
  if (link.status === "DISABLED") return unavailable("disabled");
  if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
    return unavailable("expired");
  }

  const destination = applyUtm(link.destinationUrl, link);
  const isQr = req.nextUrl.searchParams.get("qr") === "1";
  const geo = getGeo(req);

  // Record analytics. Awaited but wrapped so a logging failure never blocks
  // the redirect; the insert is a single lightweight write.
  try {
    const event = collectEvent({
      userAgentHeader: req.headers.get("user-agent"),
      referrerHeader: req.headers.get("referer"),
      languageHeader: req.headers.get("accept-language"),
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone,
      ip,
      isQr,
      linkId: link.id,
      salt: await getAnalyticsSalt(),
    });
    await prisma.linkEvent.create({
      data: {
        linkId: link.id,
        timestamp: event.timestamp,
        date: event.date,
        hour: event.hour,
        dayOfWeek: event.dayOfWeek,
        referrer: event.referrer,
        referrerDomain: event.referrerDomain,
        userAgent: event.userAgent,
        browser: event.browser,
        browserVersion: event.browserVersion,
        engine: event.engine,
        os: event.os,
        osVersion: event.osVersion,
        deviceType: event.deviceType,
        deviceVendor: event.deviceVendor,
        deviceModel: event.deviceModel,
        cpuArch: event.cpuArch,
        isMobile: event.isMobile,
        language: event.language,
        country: event.country,
        region: event.region,
        city: event.city,
        timezone: event.timezone,
        utmSource: link.utmSource,
        utmMedium: link.utmMedium,
        utmCampaign: link.utmCampaign,
        utmTerm: link.utmTerm,
        utmContent: link.utmContent,
        source: event.source,
        isBot: event.isBot,
        botReason: event.botReason,
        visitorHash: event.visitorHash,
      },
    });
  } catch {
    // swallow — never break the user's redirect on analytics failure.
  }

  return NextResponse.redirect(destination, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
