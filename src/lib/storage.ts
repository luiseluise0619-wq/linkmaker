import "server-only";
import { put, del } from "@vercel/blob";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export function isStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  sizeBytes: number;
}

/**
 * Upload an image to Vercel Blob. Storage credentials stay server-side; only
 * the resulting public URL is ever exposed to the browser.
 */
export async function uploadImage(
  file: File,
  userId: string,
): Promise<UploadResult> {
  if (!isStorageConfigured()) {
    throw new Error("Image storage is not configured.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Unsupported image type.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image exceeds the 5 MB size limit.");
  }
  const ext = file.type.split("/")[1] ?? "png";
  const key = `images/${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const blob = await put(key, file, {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: file.type,
    sizeBytes: file.size,
  };
}

export async function deleteImage(url: string): Promise<void> {
  if (!isStorageConfigured()) return;
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // Best-effort: deletion failures should not block the user action.
  }
}
