import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Base URL of the app, without trailing slash.
 *
 * Prefers NEXT_PUBLIC_APP_URL (works on both server and client). On Vercel it
 * falls back to the auto-provided deployment domain, so no env var is needed to
 * get working absolute URLs server-side. */
export function appUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

/** Build the public short URL for a slug. */
export function shortUrl(slug: string): string {
  return `${appUrl()}/go/${slug}`;
}

/** Build the portable dashboard URL for a workspace token. */
export function dashboardUrl(token: string): string {
  return `${appUrl()}/d/${token}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Display timezone for all dashboard times. Defaults to Korea (KST, UTC+9).
 * Override with the DISPLAY_TIMEZONE env var (e.g. "America/New_York"). */
export const DISPLAY_TZ = process.env.DISPLAY_TIMEZONE || "Asia/Seoul";

/** Minutes to add to a UTC instant to get the display-timezone wall clock. */
export function displayOffsetMinutes(at: Date = new Date()): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: DISPLAY_TZ,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const p: Record<string, number> = {};
    for (const part of dtf.formatToParts(at)) {
      if (part.type !== "literal") p[part.type] = Number(part.value);
    }
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
    return Math.round((asUtc - at.getTime()) / 60000);
  } catch {
    return 0;
  }
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TZ,
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DISPLAY_TZ,
  });
}
