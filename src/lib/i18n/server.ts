import "server-only";
import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  defaultLocale,
  interpolate,
  isLocale,
  type Locale,
} from "./config";
import { en } from "./dictionaries/en";
import { ko } from "./dictionaries/ko";

const dictionaries: Record<Locale, Record<string, string>> = { en, ko };

/**
 * Resolve the active locale for the current request:
 *  1. explicit cookie preference (set by the language toggle), else
 *  2. Korean if the Accept-Language header prefers it, else
 *  3. the default locale.
 */
export function getLocale(): Locale {
  const cookie = cookies().get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const accept = headers().get("accept-language")?.toLowerCase() ?? "";
  if (/(^|,|\s)ko\b/.test(accept)) return "ko";
  return defaultLocale;
}

export function getDictionary(locale: Locale): Record<string, string> {
  return dictionaries[locale];
}

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

/**
 * Server-side translator bound to the current request's locale. Falls back to
 * the English string, then to the key itself, if a translation is missing.
 */
export function getT(locale?: Locale): TranslateFn {
  const loc = locale ?? getLocale();
  const dict = dictionaries[loc];
  return (key, vars) => interpolate(dict[key] ?? en[key] ?? key, vars);
}
