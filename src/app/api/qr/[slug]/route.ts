import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { qrPngBuffer } from "@/lib/qr";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Public QR code for a slug. This encodes only the public short URL (no
 * sensitive data), so it needs no authentication — it is used by the
 * anonymous link-creation flow. Returns 404 for unknown slugs.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const link = await prisma.link.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!link) {
    return new Response("Not found", { status: 404 });
  }

  const target = `${shortUrl(params.slug)}?qr=1`;
  const png = await qrPngBuffer(target);
  const download = req.nextUrl.searchParams.get("download") === "1";
  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
      ...(download
        ? { "Content-Disposition": `attachment; filename="qr-${params.slug}.png"` }
        : {}),
    },
  });
}
