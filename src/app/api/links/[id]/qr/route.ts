import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { getOwnedLink } from "@/lib/links";
import { qrPngBuffer } from "@/lib/qr";
import { jsonNotFound, jsonUnauthorized } from "@/lib/api";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Returns a PNG QR code that encodes the SHORT url (with ?qr=1 so scans are
 * attributed to the QR source). Changing the destination never invalidates it.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();
  const link = await getOwnedLink(user.id, params.id);
  if (!link) return jsonNotFound("Link");

  const target = `${shortUrl(link.slug)}?qr=1`;
  const png = await qrPngBuffer(target);

  const download = req.nextUrl.searchParams.get("download") === "1";
  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
      ...(download
        ? { "Content-Disposition": `attachment; filename="qr-${link.slug}.png"` }
        : {}),
    },
  });
}
