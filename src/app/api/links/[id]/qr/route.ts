// ============================================================================
// [파일 목적] 내 링크의 QR 코드(PNG 이미지)를 만들어 주는 라우트
// - QR 코드는 "짧은 주소(short URL)"를 담고, ?qr=1을 붙여 QR 스캔으로 들어온
//   방문임을 구분(집계)할 수 있게 합니다.
// - 도착지 주소를 나중에 바꿔도 짧은 주소는 그대로라 QR을 다시 만들 필요가 없습니다.
// - 이 QR은 내 링크에 대한 것이므로 로그인/소유권 확인이 필요합니다.
// ============================================================================
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
  if (!user) return jsonUnauthorized(); // 비로그인이면 401
  // 소유권 확인: 내 링크가 아니면 404.
  const link = await getOwnedLink(user.id, params.id);
  if (!link) return jsonNotFound("Link");

  // QR에 담을 주소. ?qr=1을 붙여 QR로 들어온 방문임을 표시합니다.
  const target = `${shortUrl(link.slug)}?qr=1`;
  // qrPngBuffer: 주소를 QR 코드 PNG 이미지의 바이너리 데이터(Buffer)로 만들어 줍니다.
  const png = await qrPngBuffer(target);

  // ?download=1 이 있으면 "파일로 저장"되도록, 없으면 화면에 바로 표시되도록 합니다.
  const download = req.nextUrl.searchParams.get("download") === "1";
  // 이미지 자체를 응답 본문으로 돌려줍니다(JSON이 아님).
  return new Response(new Uint8Array(png), {
    status: 200, // 200 OK
    headers: {
      "Content-Type": "image/png", // 이 응답이 PNG 이미지임을 알림
      // Cache-Control private: 이 사용자 전용으로만 1시간(3600초) 캐시 허용.
      "Cache-Control": "private, max-age=3600",
      // Content-Disposition attachment: 브라우저가 화면 표시 대신 파일로 내려받게 함.
      ...(download
        ? { "Content-Disposition": `attachment; filename="qr-${link.slug}.png"` }
        : {}),
    },
  });
}
