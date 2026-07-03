import type { Metadata } from "next"
import { Montserrat, Poppins, Inter, Roboto, DM_Sans, Quicksand, Noto_Sans_KR } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import AstryxProviders from "./astryx-providers"
import "./globals.css"

// Header stack: Montserrat / Poppins (latin) -> Pretendard (Korean, loaded via CDN in globals.css)
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap" })
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" })

// Body stack: Inter / Roboto (latin) -> Noto Sans KR (Korean)
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" })
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" })
const notoSansKr = Noto_Sans_KR({ variable: "--font-noto-kr", subsets: ["latin"], display: "swap" })

// Accent stack: DM Sans / Quicksand (latin) -> Spoqa Han Sans Neo (Korean, loaded via CDN in globals.css)
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" })
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "FitCore",
  description: "Studio management platform",
}

const fontVariables = [
  montserrat.variable,
  poppins.variable,
  inter.variable,
  roboto.variable,
  notoSansKr.variable,
  dmSans.variable,
  quicksand.variable,
].join(" ")

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${fontVariables} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AstryxProviders>{children}</AstryxProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
