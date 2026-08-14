import { NextRequest } from "next/server";
import { z } from "zod";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLink, LinkError } from "@/lib/links";
import { createLinkSchema } from "@/lib/validations";
import {
  handleZodError,
  jsonError,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/request";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? 20) || 20),
  );
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const where: import("@prisma/client").Prisma.LinkWhereInput = {
    userId: user.id,
  };
  if (status === "ACTIVE" || status === "DISABLED") where.status = status;
  if (q) {
    where.OR = [
      { slug: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { destinationUrl: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, links] = await Promise.all([
    prisma.link.count({ where }),
    prisma.link.findMany({
      where,
      include: { image: true, _count: { select: { events: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return jsonOk({
    links: links.map((l) => ({
      id: l.id,
      slug: l.slug,
      shortUrl: shortUrl(l.slug),
      destinationUrl: l.destinationUrl,
      title: l.title,
      status: l.status,
      expiresAt: l.expiresAt,
      clicks: l._count.events,
      hasImage: !!l.image,
      createdAt: l.createdAt,
    })),
    pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  });
}

export async function POST(req: NextRequest) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();

  const ip = getClientIp(req);
  const rl = rateLimit(`api:create:${user.id}:${ip ?? ""}`, 30, 60_000);
  if (!rl.success) return jsonError("Rate limit exceeded. Try again soon.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error as z.ZodError);

  try {
    const link = await createLink(user.id, parsed.data);
    return jsonOk(
      {
        id: link.id,
        slug: link.slug,
        shortUrl: shortUrl(link.slug),
        destinationUrl: link.destinationUrl,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof LinkError) return jsonError(e.message, e.status);
    return jsonError("Could not create the link.", 500);
  }
}
