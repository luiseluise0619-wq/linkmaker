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
 * 계정 없이 링크를 만드는 공개 API(프로그램에서 호출하는 용도). POST로 JSON을 받는다.
 * 만들어진 익명 링크는 응답의 manageUrl 안 토큰으로 관리한다(로그인 세션이 없으므로).
 * 사람이 쓰는 랜딩 폼보다 더 빡빡한 속도 제한을 건다(분당 5개, 시간당 30개).
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
