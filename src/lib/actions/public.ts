"use server";

import { headers } from "next/headers";
import { createPublicLink, LinkError } from "@/lib/links";
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

export async function createPublicLinkAction(
  _prev: PublicLinkState,
  formData: FormData,
): Promise<PublicLinkState> {
  // Hardened, abuse-resistant limits for anonymous creation.
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
    destinationUrl: formData.get("destinationUrl"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const link = await createPublicLink(parsed.data);
    return {
      ok: true,
      data: {
        slug: link.slug,
        shortUrl: shortUrl(link.slug),
        manageUrl: `${appUrl()}/s/${link.slug}?t=${link.manageToken}`,
        linkId: link.id,
      },
    };
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not create the link." };
  }
}
