import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { qrPngBuffer } from "@/lib/qr";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * 슬러그에 대한 공개 QR 코드 이미지(PNG)를 만들어 준다. QR에는 공개 짧은 주소만
 * 담기므로(민감 정보 없음) 인증이 필요 없다. 없는 슬러그면 404를 준다.
 * ?download=1 을 붙이면 파일로 저장되도록 헤더를 바꾼다.
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
