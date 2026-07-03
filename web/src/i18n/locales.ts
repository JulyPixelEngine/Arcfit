// No "next/headers" or other server-only imports here — this file is safe
// to import from both Server Components (request.ts) and Client Components
// (LanguageSwitcher.tsx). Keep it that way.

export const LOCALES = ["ko", "en"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "ko"
export const LOCALE_COOKIE = "locale"
