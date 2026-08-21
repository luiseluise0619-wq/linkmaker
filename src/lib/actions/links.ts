// 로그인 사용자(작업공간)의 링크를 만들고/수정하고/상태변경/삭제하는 서버 액션 모음.
// 모든 함수는 먼저 requireUser()로 "내 작업공간"임을 확인한 뒤 동작한다.
// ActionResult = 화면에 결과를 알려주기 위한 공통 응답 모양 { ok, error?, data? }.
"use server";

// revalidatePath = 데이터가 바뀌었으니 해당 페이지 캐시를 새로 고치라는 지시.
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  createLink,
  deleteLink,
  updateLink,
  getOwnedLink,
  LinkError,
} from "@/lib/links";
import { prisma } from "@/lib/prisma";
import { shortUrl } from "@/lib/utils";
import { createLinkSchema, updateLinkSchema } from "@/lib/validations";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  deleteImage,
  isStorageConfigured,
  uploadImage,
} from "@/lib/storage";

export interface ActionResult<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

/** Synchronous, pre-upload validation of an image file. Returns an error
 * message, or null if the file is acceptable. */
function validateImageFile(file: File): string | null {
  if (!isStorageConfigured()) {
    return "Image storage is not configured. Set BLOB_READ_WRITE_TOKEN.";
  }
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    return "Unsupported image type.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image exceeds the 5 MB limit.";
  }
  return null;
}

function formToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") obj[k] = v;
  }
  return obj;
}

export async function createLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string; slug: string; shortUrl: string }>> {
  const user = await requireUser();
  const parsed = createLinkSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  // 이미지가 있으면 링크를 만들기 "전에" 먼저 검사한다. 링크를 만든 뒤 이미지에서
  // 실패하면 슬러그만 낭비되기 때문.
  const file = formData.get("image");
  const hasImage = file instanceof File && file.size > 0;
  if (hasImage) {
    const imageError = validateImageFile(file);
    if (imageError) return { ok: false, error: imageError };
  }

  let link;
  try {
    link = await createLink(user.id, parsed.data);
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not create the link." };
  }

  // 링크는 이미 만들어졌다. 이제 와서 이미지 업로드가 실패해도 "생성 실패"로 보고하면
  // 안 된다(슬러그가 붕 뜨게 됨). 대신 경고(warning)로만 알린다.
  let warning: string | undefined;
  if (hasImage) {
    try {
      await attachImage(user.id, link.id, file, formData.get("imageAlt"));
    } catch {
      warning = "Link created, but the image could not be uploaded.";
    }
  }
  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard");
  return {
    ok: true,
    error: warning,
    data: { id: link.id, slug: link.slug, shortUrl: shortUrl(link.slug) },
  };
}

export async function updateLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false, error: "Missing link id." };

  const parsed = updateLinkSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }

  const file = formData.get("image");
  const hasImage = file instanceof File && file.size > 0;
  if (hasImage) {
    const imageError = validateImageFile(file);
    if (imageError) return { ok: false, error: imageError };
  }

  let link;
  try {
    link = await updateLink(user.id, id, parsed.data);
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not update the link." };
  }

  let warning: string | undefined;
  if (hasImage) {
    try {
      await attachImage(user.id, id, file, formData.get("imageAlt"));
    } catch {
      warning = "Changes saved, but the image could not be uploaded.";
    }
  }
  revalidatePath("/dashboard/links");
  revalidatePath(`/dashboard/links/${link.slug}`);
  revalidatePath("/dashboard");
  return { ok: true, error: warning, data: { slug: link.slug } };
}

export async function setStatusAction(id: string, disabled: boolean) {
  const user = await requireUser();
  try {
    await updateLink(user.id, id, { status: disabled ? "DISABLED" : "ACTIVE" });
    revalidatePath("/dashboard/links");
    return { ok: true };
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not update status." };
  }
}

export async function deleteLinkAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    const link = await deleteLink(user.id, id);
    if (link.image?.url) await deleteImage(link.image.url);
    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not delete the link." };
  }
}

// 링크에 이미지를 붙인다(스토리지에 업로드 후 DB에 정보 저장). 이미 이미지가 있으면
// 먼저 지우고 새로 올린다(upsert = 있으면 갱신, 없으면 생성).
async function attachImage(
  userId: string,
  linkId: string,
  file: File,
  alt: FormDataEntryValue | null,
) {
  // 기존 이미지가 있으면 스토리지에서 먼저 삭제(쓰레기 파일이 남지 않게).
  const existing = await prisma.linkImage.findUnique({ where: { linkId } });
  if (existing?.url) await deleteImage(existing.url);

  const result = await uploadImage(file, userId);
  await prisma.linkImage.upsert({
    where: { linkId },
    create: {
      linkId,
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType,
      sizeBytes: result.sizeBytes,
      alt: typeof alt === "string" && alt ? alt : null,
    },
    update: {
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType,
      sizeBytes: result.sizeBytes,
      alt: typeof alt === "string" && alt ? alt : null,
    },
  });
}

export async function removeImageAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const link = await getOwnedLink(user.id, id);
  if (!link) return { ok: false, error: "Link not found." };
  if (link.image?.url) await deleteImage(link.image.url);
  await prisma.linkImage.deleteMany({ where: { linkId: id } });
  revalidatePath("/dashboard/links");
  if (link.slug) revalidatePath(`/dashboard/links/${link.slug}`);
  return { ok: true };
}
