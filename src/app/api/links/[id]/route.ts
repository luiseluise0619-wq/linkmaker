// ============================================================================
// [파일 목적] 링크 "하나"를 다루는 라우트 (URL의 [id]가 대상 링크를 가리킴)
// - GET: 링크 한 개 조회 / PATCH: 일부 수정 / DELETE: 삭제
// - 매번 getOwnedLink(user.id, id)로 "내가 소유한 링크인지" 확인합니다.
//   내 소유가 아니면 404를 돌려주어 다른 사람 링크에 접근하지 못하게 막습니다.
// ============================================================================
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireDbUser } from "@/lib/auth";
import {
  deleteLink,
  getOwnedLink,
  updateLink,
  LinkError,
} from "@/lib/links";
import { deleteImage } from "@/lib/storage";
import { updateLinkSchema } from "@/lib/validations";
import {
  handleZodError,
  jsonError,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/api";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";

// GET: 링크 한 개의 상세 정보를 조회합니다. params.id = URL의 [id] 값.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized(); // 비로그인이면 401
  // 내 소유(user.id)의 해당 id 링크만 가져옵니다.
  const link = await getOwnedLink(user.id, params.id);
  // 없거나 내 것이 아니면 404 Not Found(존재하지 않음으로 취급).
  if (!link) return jsonNotFound("Link");
  return jsonOk({ ...link, shortUrl: shortUrl(link.slug) }); // 200 OK
}

// PATCH: 링크의 일부 항목만 수정합니다(PUT은 전체 교체, PATCH는 부분 수정).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();

  // 요청 본문을 JSON으로 읽기. 형식이 잘못되면 400.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }
  // 수정 입력값 검증. 실패하면 어떤 항목이 잘못됐는지 에러로 반환.
  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error as z.ZodError);

  try {
    // updateLink 내부에서 user.id로 소유권을 확인하며 수정합니다.
    const link = await updateLink(user.id, params.id, parsed.data);
    return jsonOk({ ...link, shortUrl: shortUrl(link.slug) }); // 200 OK
  } catch (e) {
    if (e instanceof LinkError) return jsonError(e.message, e.status);
    return jsonError("Could not update the link.", 500); // 500
  }
}

// DELETE: 링크를 삭제합니다.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();
  try {
    // deleteLink 내부에서 user.id로 소유권을 확인한 뒤 삭제합니다.
    const link = await deleteLink(user.id, params.id);
    // 링크에 딸린 이미지가 있으면, 저장소에서 그 이미지 파일도 함께 삭제합니다.
    if (link.image?.url) await deleteImage(link.image.url);
    return jsonOk({ id: params.id }); // 200 OK, 삭제된 id 반환
  } catch (e) {
    if (e instanceof LinkError) return jsonError(e.message, e.status);
    return jsonError("Could not delete the link.", 500);
  }
}
