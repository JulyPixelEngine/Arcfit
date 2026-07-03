"use client"

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/locales"

const LABEL: Record<Locale, string> = { ko: "KO", en: "EN" }

function IconGlobe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  )
}

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale
  const router = useRouter()

  function toggleLocale() {
    const nextLocale = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000`
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label="Switch language"
      className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors ${className}`}
    >
      <IconGlobe />
      {LABEL[locale]}
    </button>
  )
}
