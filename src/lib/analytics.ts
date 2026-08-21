// 이 파일은 링크 클릭 1건에서 "측정 가능한 정보"를 뽑아내는 곳이다.
// 브라우저가 보내주는 정보(User-Agent 헤더, 언어, 리퍼러 등)와 CDN이 붙여주는
// 대략적 위치 정보를 정리해, DB에 저장할 하나의 이벤트 객체로 만든다.
import { createHash } from "crypto";
// UAParser: "User-Agent" 문자열을 분석해 브라우저/OS/기기 종류를 알아내는 라이브러리.
import { UAParser } from "ua-parser-js";
import type { DeviceType } from "@prisma/client";
import { detectBot } from "./bot";
import { extractDomain } from "./url";

export interface CollectedEvent {
  referrer: string | null;
  referrerDomain: string | null;
  userAgent: string | null;
  browser: string | null;
  browserVersion: string | null;
  engine: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: DeviceType;
  deviceVendor: string | null;
  deviceModel: string | null;
  cpuArch: string | null;
  isMobile: boolean;
  language: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  source: "LINK" | "QR";
  isBot: boolean;
  botReason: string | null;
  visitorHash: string | null;
  timestamp: Date;
  date: Date;
  hour: number;
  dayOfWeek: number;
}

function mapDeviceType(type: string | undefined): {
  deviceType: DeviceType;
  isMobile: boolean;
} {
  switch (type) {
    case "mobile":
      return { deviceType: "MOBILE", isMobile: true };
    case "tablet":
      return { deviceType: "TABLET", isMobile: true };
    case "console":
    case "smarttv":
    case "wearable":
    case "embedded":
      return { deviceType: "UNKNOWN", isMobile: false };
    default:
      // ua-parser leaves device type undefined for desktops.
      return { deviceType: "DESKTOP", isMobile: false };
  }
}

function parseLanguage(header: string | null): string | null {
  if (!header) return null;
  const first = header.split(",")[0]?.trim();
  return first ? first.slice(0, 35) : null;
}

/**
 * 방문자를 "개인정보 없이" 세기 위한 해시(hash)를 만든다.
 *
 * [해시란?] 어떤 값을 되돌릴 수 없는 고정 길이 문자열로 바꾸는 것. 같은 입력이면
 * 항상 같은 결과가 나오지만, 결과만 보고 원래 입력(IP 등)을 알아낼 수는 없다.
 *
 * [무엇을 섞나?] IP + 브라우저 정보(UA) + 링크 id + 오늘 날짜(UTC) + 서버 비밀값(salt).
 * - 원본 IP는 절대 DB에 저장하지 않는다. 오직 해시 결과만 남긴다.
 * - "오늘 날짜"를 섞으므로 매일 자정(UTC)마다 해시가 완전히 바뀐다 → 장기 추적 불가.
 * - 그래서 방문자 수는 "정확한 추적"이 아니라 "추정치"다.
 *
 * 참고: 여기서는 IP 전체를 해시 재료로 쓴다(대역만 쓰는 식의 별도 축약은 하지 않음).
 * 어차피 되돌릴 수 없고 매일 회전하므로 원본 IP가 노출되지는 않는다.
 */
export function computeVisitorHash(params: {
  ip: string | null;
  userAgent: string | null;
  linkId: string;
  date: Date;
  salt: string;
}): string | null {
  const salt = params.salt;
  // 비밀값이 없거나, IP·UA 둘 다 없으면 방문자를 특정할 근거가 없으므로 세지 않는다.
  if (!salt) return null;
  if (!params.ip && !params.userAgent) return null;
  // "2026-08-21"처럼 날짜 부분(앞 10글자)만 잘라 하루 단위 구분자로 쓴다.
  const dayKey = params.date.toISOString().slice(0, 10);
  // 재료들을 |로 이어 하나의 문자열로 만든 뒤 SHA-256으로 해시한다.
  const material = [
    salt,
    dayKey,
    params.linkId,
    params.ip ?? "",
    params.userAgent ?? "",
  ].join("|");
  // 64자 해시 중 앞 32자만 저장(충돌 위험은 무시할 수준, 저장 공간 절약).
  return createHash("sha256").update(material).digest("hex").slice(0, 32);
}

export interface CollectInput {
  userAgentHeader: string | null;
  referrerHeader: string | null;
  languageHeader: string | null;
  country: string | null;
  region: string | null;
  ip: string | null;
  isQr: boolean;
  linkId: string;
  salt: string;
  city: string | null;
  timezone: string | null;
}

export function collectEvent(input: CollectInput): CollectedEvent {
  const now = new Date(); // 클릭이 일어난 정확한 시각
  const ua = input.userAgentHeader ?? undefined;
  // UA 문자열을 분석해 브라우저/엔진/OS/기기/CPU 정보를 얻는다.
  const parser = new UAParser(ua);
  const result = parser.getResult();
  const { deviceType, isMobile } = mapDeviceType(result.device.type);
  const bot = detectBot(input.userAgentHeader);

  // 시각에서 "날짜"만 남긴 값(시/분/초를 0으로). 하루 단위 집계·방문자 해시에 쓴다.
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  return {
    referrer: input.referrerHeader ?? null,
    referrerDomain: extractDomain(input.referrerHeader),
    userAgent: input.userAgentHeader ?? null,
    browser: result.browser.name ?? null,
    browserVersion: result.browser.version ?? null,
    engine: result.engine.name ?? null,
    os: result.os.name ?? null,
    osVersion: result.os.version ?? null,
    deviceType,
    deviceVendor: result.device.vendor ?? null,
    deviceModel: result.device.model ?? null,
    cpuArch: result.cpu.architecture ?? null,
    isMobile,
    language: parseLanguage(input.languageHeader),
    country: input.country ?? null,
    region: input.region ?? null,
    city: input.city ?? null,
    timezone: input.timezone ?? null,
    source: input.isQr ? "QR" : "LINK",
    isBot: bot.isBot,
    botReason: bot.reason,
    visitorHash: computeVisitorHash({
      ip: input.ip,
      userAgent: input.userAgentHeader,
      linkId: input.linkId,
      date,
      salt: input.salt,
    }),
    timestamp: now,
    date,
    hour: now.getUTCHours(),
    dayOfWeek: now.getUTCDay(),
  };
}
