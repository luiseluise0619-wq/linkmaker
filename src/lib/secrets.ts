import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";

/**
 * 서버가 스스로 관리하는 "비밀값(secret)"들.
 *
 * [비밀값이 왜 필요?] 로그인 토큰에 서명하거나(위조 방지), 방문자 해시를 만들 때
 * 아무나 알 수 없는 무작위 문자열이 필요하다.
 *
 * [이 파일의 편의 기능] 보통은 환경변수(예: AUTH_SECRET)에 넣어두지만, 값이 없으면
 * 강력한 무작위 값을 "한 번" 만들어 DB에 저장해 재사용한다. 덕분에 DB 하나만 있으면
 * 별도 비밀값을 붙여넣지 않고도 앱이 돌아간다. 한 번 읽은 값은 메모리에 캐시한다.
 *
 * 다만 운영 환경에서는 환경변수로 명시하는 것을 권장한다(교체가 쉽고, 값이 앱 DB에만
 * 있지 않게 되므로 더 안전).
 */

// 같은 값을 매번 DB에서 읽지 않도록 메모리에 잠깐 저장해두는 캐시.
const cache = new Map<string, string>();

// key에 해당하는 비밀값을 가져오고, 없으면 새로 만들어 DB에 저장한다.
async function getOrCreateSetting(key: string): Promise<string> {
  const cached = cache.get(key);
  if (cached) return cached; // 1) 메모리에 있으면 즉시 반환

  const existing = await prisma.setting.findUnique({ where: { key } });
  if (existing) {
    cache.set(key, existing.value);
    return existing.value; // 2) DB에 있으면 그 값을 캐시 후 반환
  }

  // 3) 어디에도 없으면 32바이트 무작위 값을 새로 생성.
  const value = randomBytes(32).toString("base64");
  // upsert = "있으면 그대로 두고, 없으면 만들기". 두 요청이 동시에 생성하려는 경합을 피한다.
  const row = await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: {},
  });
  cache.set(key, row.value);
  return row.value;
}

export async function getAuthSecret(): Promise<string> {
  // Any non-empty AUTH_SECRET wins, so an explicitly-set value is never
  // silently dropped (a strong, >=32-char value is strongly recommended).
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv) return fromEnv;
  return getOrCreateSetting("authSecret");
}

export async function getAnalyticsSalt(): Promise<string> {
  const fromEnv = process.env.ANALYTICS_SALT;
  if (fromEnv) return fromEnv;
  return getOrCreateSetting("analyticsSalt");
}
