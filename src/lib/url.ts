/**
 * 목적지(destination) URL 검증.
 *
 * 사용자가 "이 주소로 보내줘"라고 넣는 URL을 그대로 믿으면 위험하다. 그래서 여기서
 * 안전하지 않은 주소를 걸러낸다. 초보자를 위한 핵심 용어:
 *
 * - [XSS] javascript:, data: 같은 주소로 리다이렉트하면 남의 브라우저에서 악성
 *   스크립트가 실행될 수 있다. → http/https만 허용해서 막는다.
 * - [SSRF / 오픈 리다이렉트] 127.0.0.1, localhost, 사설망(10.x, 192.168.x) 같은
 *   "내부 주소"로 보내지게 하면, 공격자가 서버 내부망을 훔쳐보거나 클라우드의
 *   비밀 정보 주소(169.254.169.254)에 접근하게 만들 수 있다. → 내부/루프백 주소를 막는다.
 *
 * 주의: 여기서는 DNS를 실제로 조회하지 않는 "겉모습" 검사다(최선의 방어).
 */

// 이름만으로 딱 막아야 하는 호스트들(정확히 일치하면 거부).
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
  "[::1]",
  "metadata.google.internal",
]);

// IPv4 주소가 "내부용(사설/루프백)"인지 판단한다. 예: 10.x, 192.168.x, 127.x.
// 이런 주소는 인터넷의 공개 사이트가 아니라 내 컴퓨터/내부망을 가리키므로 막는다.
function isPrivateIpv4(host: string): boolean {
  // 점으로 구분된 4개의 숫자(0~255) 형태인지 확인.
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 0) return true;
  if (a === 10) return true; // 사설망
  if (a === 127) return true; // 루프백(내 컴퓨터 자신)
  if (a === 169 && b === 254) return true; // 링크-로컬 / 클라우드 메타데이터(민감!)
  if (a === 172 && b >= 16 && b <= 31) return true; // 사설망
  if (a === 192 && b === 168) return true; // 사설망(집/사무실 공유기)
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
  // Numeric-only, dot-separated, but not exactly four octets (e.g. 127.1)
  if (/^[\d.]+$/.test(host) && host.split(".").length !== 4) return true;
  // Hex/octal IP encodings (e.g. 0x7f000001, 0177.0.0.1) only matter when the
  // host is an IP encoding, never a real domain name. A real domain ends in an
  // alphabetic TLD; an IP encoding does not. Gate the hex/octal heuristics on
  // "no alphabetic TLD" so ordinary sites like 01net.com / 0xford.com are not
  // wrongly rejected while 0x7f000001 / 0177.0.0.1 still are.
  const labels = host.split(".");
  const lastLabel = labels[labels.length - 1] ?? "";
  const hasAlphaTld = /^[a-z]{2,}$/i.test(lastLabel);
  if (!hasAlphaTld) {
    if (/(^|\.)0x[0-9a-f]+/i.test(host)) return true;
    if (/(^|\.)0\d+/.test(host)) return true;
  }
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

  // Strip a single trailing dot: `localhost.` / `127.0.0.1.` are valid FQDNs
  // that resolve to the same host, so normalize before the blocklist/IP checks
  // (otherwise `http://localhost./` would slip through).
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
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

/**
 * 목적지 URL에 UTM 파라미터를 붙인다(기존 쿼리스트링은 그대로 유지).
 * [UTM이란?] 방문자가 "어디서 왔는지"를 URL에 표시하는 표준 태그.
 *   utm_source(출처: instagram 등), utm_medium(매체: social 등), utm_campaign(캠페인명) 등.
 * 이미 같은 파라미터가 URL에 있으면 덮어쓰지 않는다(사용자 값 우선).
 */
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
