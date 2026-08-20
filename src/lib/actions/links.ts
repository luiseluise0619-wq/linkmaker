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

  // Validate the image up front so we never create a link and *then* fail.
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

  // The link exists now; a later storage failure must not report the whole
  // creation as failed (it would strand a slug). Surface it as a warning.
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

async function attachImage(
  userId: string,
  linkId: string,
  file: File,
  alt: FormDataEntryValue | null,
) {
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
