import { createHash } from "crypto";
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
  os: string | null;
  deviceType: DeviceType;
  isMobile: boolean;
  language: string | null;
  country: string | null;
  region: string | null;
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
 * Build a privacy-preserving, daily-rotating visitor hash. We never store raw
 * IPs. The hash combines a coarse IP + UA + link id + the current UTC date +
 * a server secret salt, so it cannot be reversed and rotates every 24h. This
 * gives an ESTIMATE of unique visitors without persistent tracking.
 */
export function computeVisitorHash(params: {
  ip: string | null;
  userAgent: string | null;
  linkId: string;
  date: Date;
  salt: string;
}): string | null {
  const salt = params.salt;
  if (!salt) return null;
  if (!params.ip && !params.userAgent) return null;
  const dayKey = params.date.toISOString().slice(0, 10);
  const material = [
    salt,
    dayKey,
    params.linkId,
    params.ip ?? "",
    params.userAgent ?? "",
  ].join("|");
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
}

export function collectEvent(input: CollectInput): CollectedEvent {
  const now = new Date();
  const ua = input.userAgentHeader ?? undefined;
  const parser = new UAParser(ua);
  const result = parser.getResult();
  const { deviceType, isMobile } = mapDeviceType(result.device.type);
  const bot = detectBot(input.userAgentHeader);

  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  return {
    referrer: input.referrerHeader ?? null,
    referrerDomain: extractDomain(input.referrerHeader),
    userAgent: input.userAgentHeader ?? null,
    browser: result.browser.name ?? null,
    browserVersion: result.browser.version ?? null,
    os: result.os.name ?? null,
    deviceType,
    isMobile,
    language: parseLanguage(input.languageHeader),
    country: input.country ?? null,
    region: input.region ?? null,
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
