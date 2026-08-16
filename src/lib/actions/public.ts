"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { createGuestUserAndSession, getSessionUser } from "@/lib/auth";
import { createLink, LinkError } from "@/lib/links";
import { prisma } from "@/lib/prisma";
import { createPublicLinkSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/ratelimit";
import { appUrl, shortUrl } from "@/lib/utils";

export interface PublicLinkState {
  ok: boolean;
  error?: string;
  data?: {
    slug: string;
    shortUrl: string;
    manageUrl: string;
    linkId: string;
  };
}

function clientIp(): string {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") || "unknown";
}

/**
 * Create a link from the landing page without an account. If the visitor has
 * no session, a guest account is auto-provisioned so they immediately get a
 * full dashboard; they can upgrade it to a real account later. A shareable,
 * token-gated stats link is also returned.
 */
export async function createPublicLinkAction(
  _prev: PublicLinkState,
  formData: FormData,
): Promise<PublicLinkState> {
  const ip = clientIp();
  const perMinute = rateLimit(`pub:min:${ip}`, 5, 60_000);
  const perHour = rateLimit(`pub:hour:${ip}`, 30, 60 * 60_000);
  if (!perMinute.success || !perHour.success) {
    return {
      ok: false,
      error: "You're creating links too quickly. Please try again later.",
    };
  }

  const parsed = createPublicLinkSchema.safeParse({
    destinationUrl: formData.get("destinationUrl") ?? undefined,
    // An absent (unrendered) slug field is `null`; treat it as omitted.
    slug: (formData.get("slug") as string | null) ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  // Reuse the current session, or provision a guest so they get a dashboard.
  let user = await getSessionUser();
  if (!user) user = await createGuestUserAndSession();

  try {
    const link = await createLink(user.id, {
      destinationUrl: parsed.data.destinationUrl,
      slug: parsed.data.slug,
    });
    // Attach a shareable, token-gated stats link.
    const manageToken = randomBytes(24).toString("base64url");
    await prisma.link.update({
      where: { id: link.id },
      data: { manageToken },
    });
    return {
      ok: true,
      data: {
        slug: link.slug,
        shortUrl: shortUrl(link.slug),
        manageUrl: `${appUrl()}/s/${link.slug}?t=${manageToken}`,
        linkId: link.id,
      },
    };
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not create the link." };
  }
}
