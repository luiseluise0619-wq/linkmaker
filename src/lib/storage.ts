// 이 파일은 링크에 붙는 이미지 파일을 Vercel Blob(클라우드 파일 저장소)에
// 올리고 지우는 일을 담당한다.
// "server-only" = 이 코드는 반드시 서버에서만 실행된다는 표시. 저장소 비밀 키가
// 브라우저(사용자 쪽)로 새어 나가지 않도록 막아 준다.
import "server-only";
// put = 파일 올리기, del = 파일 삭제하기 (Vercel Blob 라이브러리 함수).
import { put, del } from "@vercel/blob";

// 허용하는 이미지 최대 크기: 5MB (1024 * 1024 = 1MB이므로 곱하기 5).
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
// 업로드를 허용하는 이미지 형식 목록. 이 목록에 없는 형식은 거부한다.
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

// 파일 저장소를 쓸 준비가 되어 있는지(비밀 키가 설정되어 있는지) 확인한다.
// !! 는 값을 true/false로 바꾸는 관용 표현: 키가 있으면 true, 없으면 false.
export function isStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// 업로드 성공 후 돌려줄 정보의 모양(타입). 브라우저에는 이 중 공개 url만 전달된다.
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
  // 업로드 전에 3가지를 검사한다: (1) 저장소 준비 여부 (2) 허용된 이미지 형식인지
  // (3) 크기가 5MB를 넘지 않는지. 문제가 있으면 throw로 오류를 내고 중단한다.
  if (!isStorageConfigured()) {
    throw new Error("Image storage is not configured.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Unsupported image type.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image exceeds the 5 MB size limit.");
  }
  // 저장할 파일 경로(key)를 만든다. 파일들이 서로 겹치지 않도록
  // "images/사용자ID/현재시각-무작위6글자.확장자" 형태로 유일한 이름을 짓는다.
  // file.type이 "image/png"이면 split("/")[1]로 "png"를 뽑아 확장자로 쓴다.
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

// 저장소에서 이미지 파일을 지운다. 삭제가 실패해도(예: 이미 없는 파일)
// try/catch로 오류를 무시한다 — 사용자의 작업(링크 삭제 등)까지 막지 않기 위해서.
export async function deleteImage(url: string): Promise<void> {
  if (!isStorageConfigured()) return;
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // Best-effort: deletion failures should not block the user action.
  }
}
