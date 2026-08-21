/**
 * Internationalization config shared by both server and client code.
 * Keep this module free of any server-only or client-only imports.
 */
export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * Final fallback when no cookie preference is set and the Accept-Language
 * header does not indicate Korean. Korean browsers are auto-detected server
 * side, and either language can be chosen with the in-app toggle.
 */
export const defaultLocale: Locale = "en";

/** Non-httpOnly cookie holding the visitor's language preference. */
export const LOCALE_COOKIE = "lm_lang";

/** One year, in seconds — how long the language preference cookie lives. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ko" || value === "en";
}

/**
 * Replace {placeholder} tokens in a translated string with provided values.
 * Missing values are left as-is. Used by both the server and client helpers.
 */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
