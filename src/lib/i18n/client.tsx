"use client";

import * as React from "react";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  defaultLocale,
  interpolate,
  type Locale,
} from "./config";

type I18nValue = {
  locale: Locale;
  dict: Record<string, string>;
  /** English fallback so a missing key still renders sensible text. */
  fallback: Record<string, string>;
};

const I18nContext = React.createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  fallback,
  children,
}: I18nValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ locale, dict, fallback }),
    [locale, dict, fallback],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

/** Client-side translator. Mirrors the server getT() call signature. */
export function useT(): TranslateFn {
  const ctx = React.useContext(I18nContext);
  return React.useCallback(
    (key, vars) => {
      const raw = ctx?.dict[key] ?? ctx?.fallback[key] ?? key;
      return interpolate(raw, vars);
    },
    [ctx],
  );
}

export function useLocale(): Locale {
  return React.useContext(I18nContext)?.locale ?? defaultLocale;
}

/** Persist a language choice in a cookie the server reads on the next render. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
