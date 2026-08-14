"use server";

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
): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireUser();
  const parsed = createLinkSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }
  try {
    const link = await createLink(user.id, parsed.data);

    // Optional image upload in the same submission.
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      await attachImage(user.id, link.id, file, formData.get("imageAlt"));
    }
    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: link.id, slug: link.slug } };
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not create the link." };
  }
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
  try {
    const link = await updateLink(user.id, id, parsed.data);

    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      await attachImage(user.id, id, file, formData.get("imageAlt"));
    }
    revalidatePath("/dashboard/links");
    revalidatePath(`/dashboard/links/${link.slug}`);
    revalidatePath("/dashboard");
    return { ok: true, data: { slug: link.slug } };
  } catch (e) {
    if (e instanceof LinkError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not update the link." };
  }
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

async function attachImage(
  userId: string,
  linkId: string,
  file: File,
  alt: FormDataEntryValue | null,
) {
  if (!isStorageConfigured()) {
    throw new LinkError(
      "Image storage is not configured. Set BLOB_READ_WRITE_TOKEN.",
      400,
    );
  }
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    throw new LinkError("Unsupported image type.", 422);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new LinkError("Image exceeds the 5 MB limit.", 422);
  }
  // Remove any previous image first.
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
