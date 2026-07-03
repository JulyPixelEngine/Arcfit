import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./locales"

export { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale }

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const locale: Locale = LOCALES.includes(cookieLocale as Locale) ? (cookieLocale as Locale) : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
