/**
 * Destination URL validation.
 *
 * We only accept absolute http/https URLs. We reject non-web schemes
 * (javascript:, data:, file:, etc.) to prevent XSS via redirect and reject
 * obviously internal / loopback hosts to reduce open-redirect-to-internal
 * and SSRF-style abuse. This is best-effort: DNS is not resolved here.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
  "[::1]",
  "metadata.google.internal",
]);

function isPrivateIpv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Reject hosts that look like an IP address but use a non-standard encoding
 * (hex/octal/decimal-integer, or fewer than 4 octets) — e.g. `127.1`,
 * `0x7f.0.0.1`, `2130706433`. These normalize to loopback/internal addresses
 * but slip past the dotted-quad check, so we block anything IP-like that is
 * not a clean, fully-qualified dotted-quad.
 */
function isSuspiciousNumericHost(host: string): boolean {
  // Pure decimal integer (e.g. 2130706433 === 127.0.0.1)
  if (/^\d+$/.test(host)) return true;
  // Any hex or octal-looking component
  if (/(^|\.)0x[0-9a-f]+/i.test(host)) return true;
  if (/(^|\.)0\d+/.test(host)) return true;
  // Numeric-only, dot-separated, but not exactly four octets (e.g. 127.1)
  if (/^[\d.]+$/.test(host) && host.split(".").length !== 4) return true;
  return false;
}

/** IPv6 loopback / unique-local (fc00::/7) / link-local (fe80::/10) /
 * unspecified, plus IPv4-mapped forms pointing at private space. */
function isBlockedIpv6(hostNoBrackets: string): boolean {
  const h = hostNoBrackets.toLowerCase();
  if (!h.includes(":")) return false;
  if (h === "::1" || h === "::") return true;
  if (/^f[cd][0-9a-f]*:/.test(h)) return true; // fc00::/7 ULA
  if (/^fe[89ab][0-9a-f]*:/.test(h)) return true; // fe80::/10 link-local
  // IPv4-mapped addresses (`::ffff:…`) are just IPv4 in disguise and never a
  // legitimate destination — the URL parser also rewrites the dotted form to
  // hex, so block the whole mapped range.
  if (/::ffff:/i.test(h)) return true;
  // Any other embedded dotted-quad (e.g. `::127.0.0.1`) in private space.
  const v4 = h.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4 && (isPrivateIpv4(v4[1]) || v4[1] === "0.0.0.0")) return true;
  if (/^0+(:0+)*$/.test(h)) return true;
  return false;
}

export type UrlValidationResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export function validateDestinationUrl(input: string): UrlValidationResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Destination URL is required." };
  if (raw.length > 2048)
    return { ok: false, error: "Destination URL is too long." };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return {
      ok: false,
      error: "Enter a valid absolute URL, e.g. https://example.com/page.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http and https URLs are allowed." };
  }

  const host = parsed.hostname.toLowerCase();
  const hostNoBrackets = host.replace(/^\[|\]$/g, "");
  if (
    BLOCKED_HOSTNAMES.has(host) ||
    BLOCKED_HOSTNAMES.has(hostNoBrackets) ||
    isPrivateIpv4(hostNoBrackets) ||
    isSuspiciousNumericHost(hostNoBrackets) ||
    isBlockedIpv6(hostNoBrackets)
  ) {
    return { ok: false, error: "That destination host is not allowed." };
  }
  // Hostname must contain a dot (reject bare hostnames) unless it is an IP.
  if (!host.includes(".") && !host.includes(":")) {
    return { ok: false, error: "Enter a valid public destination host." };
  }

  return { ok: true, url: parsed.toString() };
}

/** Append UTM params to a URL, preserving any existing query. */
export function applyUtm(
  destination: string,
  utm: {
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
    utmContent?: string | null;
  },
): string {
  try {
    const url = new URL(destination);
    const map: Record<string, string | null | undefined> = {
      utm_source: utm.utmSource,
      utm_medium: utm.utmMedium,
      utm_campaign: utm.utmCampaign,
      utm_term: utm.utmTerm,
      utm_content: utm.utmContent,
    };
    for (const [key, value] of Object.entries(map)) {
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  } catch {
    return destination;
  }
}

export function extractDomain(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}
