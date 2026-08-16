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
  const link = await prisma.link.findUnique({
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
  });

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
        os: event.os,
        deviceType: event.deviceType,
        isMobile: event.isMobile,
        language: event.language,
        country: event.country,
        region: event.region,
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
