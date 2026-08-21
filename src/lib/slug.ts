// slug(슬러그) = 짧은 링크의 주소 끝부분. 예: linkmaker.app/go/`abc123`의 `abc123`.
// 이 파일은 슬러그를 자동 생성하고, 사용자가 직접 입력한 슬러그가 유효한지 검사한다.
import { customAlphabet } from "./nanoid";

// 헷갈리는 글자(숫자 0/영문 O, 숫자 1/영문 l/영문 I)를 뺀, URL에 안전한 문자 모음.
// 사람이 보고 따라 적기 쉽도록 하기 위함.
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
// 위 문자들로 이루어진 7글자 랜덤 슬러그를 만드는 함수.
const generate = customAlphabet(ALPHABET, 7);

export const SLUG_MIN = 3; // 최소 길이
export const SLUG_MAX = 64; // 최대 길이
// 사용자가 직접 정하는 슬러그에 허용되는 문자: 영문/숫자/밑줄/하이픈.
export const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

// 앱의 실제 경로와 겹치면 안 되는 예약어들(이걸 슬러그로 쓰면 라우팅이 충돌).
export const RESERVED_SLUGS = new Set([
  "api",
  "go",
  "dashboard",
  "login",
  "register",
  "logout",
  "privacy",
  "settings",
  "links",
  "analytics",
  "campaigns",
  "admin",
  "new",
  "static",
  "_next",
  "favicon.ico",
]);

// 자동으로 랜덤 슬러그 1개를 만든다.
export function randomSlug(): string {
  return generate();
}

// 사용자가 입력한 슬러그가 규칙을 모두 지키는지(길이·문자·예약어) 검사한다.
export function isValidSlug(slug: string): boolean {
  return (
    slug.length >= SLUG_MIN &&
    slug.length <= SLUG_MAX &&
    SLUG_PATTERN.test(slug) &&
    !RESERVED_SLUGS.has(slug.toLowerCase())
  );
}
