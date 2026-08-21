// 이 파일은 사용자가 폼에 입력한 값이 올바른지 검사하는 "규칙(스키마)"을 모아 둔다.
// Zod = 입력값의 형태와 조건을 규칙으로 정의하고 자동으로 검사해 주는 라이브러리.
// 예: "문자열이어야 함", "최소 8글자", "이메일 형식이어야 함" 같은 조건을 붙인다.
// .trim() = 앞뒤 공백 제거, .max(n) = 최대 길이, .optional() = 없어도 됨.
import { z } from "zod";
// 슬러그 규칙 상수들: 최소/최대 길이와 허용 글자 패턴(정규식)을 slug.ts에서 가져온다.
import { SLUG_MAX, SLUG_MIN, SLUG_PATTERN } from "./slug";

// [생성용] 값이 없거나 빈 문자열이면 그냥 "설정 안 함"(undefined)으로 처리하는 규칙.
const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

// [수정용] 세 가지 상태를 구분하는 규칙:
//  - 아예 값이 안 옴(undefined) -> 기존 값 그대로 두기
//  - 빈 문자열이 옴("")        -> null 로 바꿔 "값 지우기"
//  - 실제 값이 옴             -> 그 값으로 바꾸기
// 덕분에 수정 폼에서 제목/설명/UTM 값을 실제로 "비워서 삭제"할 수 있다.
const clearableTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "" ? null : v));

// UTM = 링크에 붙이는 마케팅 추적용 꼬리표(어디서 유입됐는지 분석하려고 붙임).
// 예: utm_source=google, utm_medium=email. 최대 255글자까지 허용한다.
const utmField = optionalTrimmedString(255);
const clearableUtmField = clearableTrimmedString(255);

// slug(슬러그) 검사 규칙: 길이(최소~최대)와 허용 글자(영문/숫자/-/_)를 확인한다.
// SLUG_PATTERN은 정규식으로, 허용되지 않은 글자가 있으면 오류 메시지를 낸다.
export const slugSchema = z
  .string()
  .trim()
  .min(SLUG_MIN, `Slug must be at least ${SLUG_MIN} characters.`)
  .max(SLUG_MAX, `Slug must be at most ${SLUG_MAX} characters.`)
  .regex(SLUG_PATTERN, "Slug may only contain letters, numbers, - and _.");

// [링크 생성] 폼 규칙. destinationUrl(최종 목적지 주소)은 반드시 있어야 하고,
// slug는 선택(비우면 자동 생성). 나머지 제목/설명/캠페인/만료일/UTM은 선택 항목.
export const createLinkSchema = z.object({
  destinationUrl: z.string().trim().min(1, "Destination URL is required."),
  // 슬러그: 규칙에 맞으면 사용하고, 빈 문자열이면 undefined로 바꿔 "자동 생성"하게 한다.
  slug: slugSchema.optional().or(z.literal("").transform(() => undefined)),
  title: optionalTrimmedString(200),
  description: optionalTrimmedString(1000),
  campaignId: z.string().trim().optional().transform((v) => (v ? v : undefined)),
  // expiresAt = 링크 만료일(이 날 이후엔 링크가 작동 안 함). 선택 항목.
  // .refine(...) = 추가 검사: 값이 있으면 그것이 올바른 날짜인지 확인한다.
  // Date.parse가 NaN(숫자가 아님)이면 날짜로 해석 불가 -> 오류.
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine(
      (v) => v === undefined || !Number.isNaN(Date.parse(v)),
      "Invalid expiration date.",
    ),
  utmSource: utmField,
  utmMedium: utmField,
  utmCampaign: utmField,
  utmTerm: utmField,
  utmContent: utmField,
});

// [링크 수정] 폼 규칙. 생성과 달리 모든 항목이 "선택"이다(바꿀 것만 보내면 됨).
// status는 ACTIVE(활성)/DISABLED(비활성) 둘 중 하나만 허용한다.
export const updateLinkSchema = z.object({
  destinationUrl: z.string().trim().min(1).optional(),
  slug: slugSchema.optional(),
  title: clearableTrimmedString(200),
  description: clearableTrimmedString(1000),
  campaignId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  expiresAt: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v))
    .refine(
      (v) => v === undefined || v === null || !Number.isNaN(Date.parse(v)),
      "Invalid expiration date.",
    ),
  utmSource: clearableUtmField,
  utmMedium: clearableUtmField,
  utmCampaign: clearableUtmField,
  utmTerm: clearableUtmField,
  utmContent: clearableUtmField,
});

// [공개(로그인 없음) 링크 생성] 랜딩 페이지에서 쓰는 최소 규칙: 목적지 주소와 슬러그만.
export const createPublicLinkSchema = z.object({
  destinationUrl: z.string().trim().min(1, "Destination URL is required."),
  slug: slugSchema.optional().or(z.literal("").transform(() => undefined)),
});

// [캠페인 생성] 규칙: 이름은 필수(최대 120자), 설명은 선택(최대 500자).
export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  description: optionalTrimmedString(500),
});

// [회원 가입] 규칙: 이름 필수, 이메일은 형식 검사 + 소문자로 통일, 비밀번호는 8자 이상.
// .toLowerCase() = 이메일을 소문자로 바꿔 대소문자 차이로 중복 계정이 생기는 걸 막는다.
export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(200),
});

// [로그인] 규칙: 올바른 이메일 형식과 비밀번호(비어 있지 않을 것)만 확인한다.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

// z.infer<...> = 위에서 정의한 검사 규칙으로부터 TypeScript 타입을 자동으로 뽑아낸다.
// 규칙과 타입을 따로 관리하지 않아도 되어 실수가 줄어든다.
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
