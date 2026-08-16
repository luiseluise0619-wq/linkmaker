import { NextRequest } from "next/server";
import { z } from "zod";
import { createPublicLink, LinkError } from "@/lib/links";
import { createPublicLinkSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/request";
import { appUrl, shortUrl } from "@/lib/utils";
import { handleZodError, jsonError, jsonOk } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Public, no-account link creation. Hardened rate limits; anonymous links are
 * managed via the returned `manageUrl` token (there is no login session).
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req) ?? "unknown";
  const perMinute = rateLimit(`pubapi:min:${ip}`, 5, 60_000);
  const perHour = rateLimit(`pubapi:hour:${ip}`, 30, 60 * 60_000);
  if (!perMinute.success || !perHour.success) {
    return jsonError("Rate limit exceeded. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = createPublicLinkSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error as z.ZodError);

  try {
    const link = await createPublicLink(parsed.data);
    return jsonOk(
      {
        slug: link.slug,
        shortUrl: shortUrl(link.slug),
        manageUrl: `${appUrl()}/s/${link.slug}?t=${link.manageToken}`,
        qrUrl: `${appUrl()}/api/qr/${link.slug}`,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof LinkError) return jsonError(e.message, e.status);
    return jsonError("Could not create the link.", 500);
  }
}
